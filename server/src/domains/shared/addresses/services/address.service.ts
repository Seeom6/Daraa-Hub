import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AddressRepository } from '../repositories/address.repository';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressDocument } from '../../../../database/schemas/address.schema';

const MAX_ADDRESSES_PER_CUSTOMER = 10;

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  /**
   * Create a new address for a customer
   */
  async create(
    customerId: string,
    dto: CreateAddressDto,
  ): Promise<AddressDocument> {
    // Check address limit
    const count = await this.addressRepository.countByCustomerId(customerId);
    if (count >= MAX_ADDRESSES_PER_CUSTOMER) {
      throw new BadRequestException(
        `Maximum ${MAX_ADDRESSES_PER_CUSTOMER} addresses allowed per customer`,
      );
    }

    // If this is the first address or marked as default, set it as default
    const isFirstAddress = count === 0;
    const shouldBeDefault = isFirstAddress || dto.isDefault;

    // If setting as default, unset others
    if (shouldBeDefault && count > 0) {
      await this.addressRepository
        .getModel()
        .updateMany({ customerId, isActive: true }, { isDefault: false });
    }

    // Build full address if not provided
    const fullAddress = dto.fullAddress || this.buildFullAddress(dto);

    // Prepare location if coordinates provided
    const location =
      dto.latitude && dto.longitude
        ? { type: 'Point' as const, coordinates: [dto.longitude, dto.latitude] }
        : undefined;

    const address = await this.addressRepository.create({
      customerId: new Types.ObjectId(customerId),
      label: dto.label,
      type: dto.type,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      alternatePhone: dto.alternatePhone,
      city: dto.city,
      district: dto.district,
      street: dto.street,
      building: dto.building,
      floor: dto.floor,
      apartment: dto.apartment,
      nearbyLandmark: dto.nearbyLandmark,
      fullAddress,
      location,
      deliveryInstructions: dto.deliveryInstructions,
      isDefault: shouldBeDefault,
    } as unknown as Partial<AddressDocument>);

    return address;
  }

  /**
   * Get all addresses for a customer
   */
  async findAllByCustomer(customerId: string): Promise<AddressDocument[]> {
    return this.addressRepository.findByCustomerId(customerId);
  }

  /**
   * Get a specific address by ID
   */
  async findById(
    addressId: string,
    customerId: string,
  ): Promise<AddressDocument> {
    const address = await this.addressRepository.findById(addressId);

    if (!address || !address.isActive) {
      throw new NotFoundException('Address not found');
    }

    if (address.customerId.toString() !== customerId) {
      throw new ForbiddenException('You do not have access to this address');
    }

    return address;
  }

  /**
   * Get the default address for a customer
   */
  async findDefault(customerId: string): Promise<AddressDocument | null> {
    return this.addressRepository.findDefaultAddress(customerId);
  }

  /**
   * Update an address
   */
  async update(
    addressId: string,
    customerId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressDocument> {
    // Verify ownership
    await this.findById(addressId, customerId);

    // If setting as default, handle it properly
    if (dto.isDefault === true) {
      return this.setAsDefault(addressId, customerId);
    }

    // Build location if coordinates provided
    const updateData: Partial<AddressDocument> = { ...dto };
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    // Rebuild full address if address components changed
    if (dto.city || dto.district || dto.street || dto.building) {
      const currentAddress = await this.addressRepository.findById(addressId);
      const merged = { ...currentAddress?.toObject(), ...dto };
      updateData.fullAddress = dto.fullAddress || this.buildFullAddress(merged);
    }

    const updated = await this.addressRepository.update(addressId, updateData);
    if (!updated) {
      throw new NotFoundException('Address not found');
    }

    return updated;
  }

  /**
   * Set an address as default
   */
  async setAsDefault(
    addressId: string,
    customerId: string,
  ): Promise<AddressDocument> {
    await this.findById(addressId, customerId);

    const updated = await this.addressRepository.setAsDefault(
      customerId,
      addressId,
    );
    if (!updated) {
      throw new NotFoundException('Address not found');
    }

    return updated;
  }

  /**
   * Delete an address (soft delete)
   */
  async delete(addressId: string, customerId: string): Promise<void> {
    const address = await this.findById(addressId, customerId);

    await this.addressRepository.softDelete(addressId);

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const addresses =
        await this.addressRepository.findByCustomerId(customerId);
      if (addresses.length > 0) {
        const firstAddress = addresses[0];
        await this.addressRepository.setAsDefault(
          customerId,
          (firstAddress as any)._id.toString(),
        );
      }
    }
  }

  /**
   * Mark address as used (for order placement)
   */
  async markAsUsed(addressId: string): Promise<void> {
    await this.addressRepository.incrementUsage(addressId);
  }

  /**
   * Build full address from components
   */
  private buildFullAddress(dto: Partial<CreateAddressDto>): string {
    const parts: string[] = [];

    if (dto.building) parts.push(dto.building);
    if (dto.street) parts.push(dto.street);
    if (dto.district) parts.push(dto.district);
    if (dto.city) parts.push(dto.city);

    return parts.join('، '); // Arabic comma
  }

  /**
   * Convert address to delivery address format (for orders)
   */
  toDeliveryAddress(address: AddressDocument) {
    return {
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      fullAddress: address.fullAddress,
      city: address.city,
      district: address.district,
      location: address.location,
      notes: address.deliveryInstructions,
    };
  }
}
