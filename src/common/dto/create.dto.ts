import { OmitType } from '@nestjs/mapped-types';
import { BaseDto } from './base.dto';

export class CreateDto extends OmitType(BaseDto, ['id', 'createdAt'] as const) { }