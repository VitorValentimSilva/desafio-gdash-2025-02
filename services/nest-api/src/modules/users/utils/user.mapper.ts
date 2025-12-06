import { UserResponseDto } from '../dto/user-response.dto';
import { UserDocument } from '../schemas/user.schema';
import { PlainUser } from '../users.service';

export function mapToResponse(user: PlainUser | UserDocument): UserResponseDto {
  const id =
    user._id?.toString?.() ?? (user as unknown as { id?: string }).id ?? '';
  return {
    id,
    email: (user as unknown as { email: string }).email,
    role: (user as unknown as { role: string }).role,
    active: (user as unknown as { active?: boolean }).active ?? true,
    name: (user as unknown as { name?: string }).name,
    bio: (user as unknown as { bio?: string }).bio,
    location: (user as unknown as { location?: string }).location,
    photo: (user as unknown as { photo?: string }).photo,
    createdAt:
      (user as unknown as { createdAt?: Date }).createdAt ?? new Date(),
    updatedAt:
      (user as unknown as { updatedAt?: Date }).updatedAt ?? new Date(),
  };
}
