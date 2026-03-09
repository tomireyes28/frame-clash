import { Role } from "@prisma/client";


export class CreateUserFromGoogleDto {
  email!: string;
  name!: string;
  image!: string;
  role?: Role;
}