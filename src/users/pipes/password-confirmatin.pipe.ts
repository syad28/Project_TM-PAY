import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto, ChangePasswordDto, ChangePinDto, ResetPasswordDto } from '../dto';

@Injectable()
export class PasswordConfirmationPipe implements PipeTransform {
    transform(value: CreateUserDto | ChangePasswordDto | ResetPasswordDto) {
        if (this.isCreateUserDto(value)) {
            if (value.password !== value.password_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password dan konfirmasi password tidak sama'
                });
            }
            const { password_confirmation, ...rest } = value;
            return rest;
        }
        if (this.isChangePasswordDto(value)) {
            if (value.new_password !== value.new_password_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password baru dan konfirmasi tidak sama'
                });
            }
            const { new_password_confirmation, ...rest } = value;
            return rest;
        }
        if (this.isResetPasswordDto(value)) {
            if (value.new_password !== value.new_password_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password baru dan konfirmasi tidak sama'
                });
            }
            const { new_password_confirmation, ...rest } = value;
            return rest;
        }
        return value;
    }
    private isCreateUserDto(value: any): value is CreateUserDto {
        return 'password' in value && 'password_confirmation' in value && 'nama' in value;
    }
    private isChangePasswordDto(value: any): value is ChangePasswordDto {
        return 'current_password' in value && 'new_password' in value && 'new_password_confirmation' in value;
    }
    private isResetPasswordDto(value: any): value is ResetPasswordDto {
        return 'token' in value && 'new_password' in value && 'new_password_confirmation' in value;
    }
}

@Injectable()
export class PinConfirmationPipe implements PipeTransform {
    transform(value: ChangePinDto) {
        if (value.new_pin !== value.new_pin_confirmation) {
            throw new BadRequestException({
                statusCode: 400,
                message: 'PIN baru dan konfirmasi tidak sama'
            });
        }
        const { new_pin_confirmation, ...rest } = value;
        return rest;
    }
}