
export enum Role {
  Doctor = 'Doctor',
  Pharmacist = 'Pharmacist',
  Admin = 'Admin',
}

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName?: string;
  governmentId?: string;
  email?: string;
  phoneNumber?: string;
  physicalAddress?: string;

  // Doctor-specific
  licenseNumber?: string;
  clinicName?: string;

  // Pharmacist-specific
  pharmacyName?: string;
  pharmacyLicenseNumber?: string;
}

export interface PharmacistRegistrationData extends Omit<User, 'id' | 'role' | 'licenseNumber' | 'clinicName'> {
    password: string;
}

export interface DoctorRegistrationData extends Omit<User, 'id' | 'role' | 'pharmacyName' | 'pharmacyLicenseNumber'> {
    password: string;
}


export interface PrescriptionData {
  medicineNames: string[];
  dosages: string[];
  doctorName: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  date: string;
}

export interface BlockchainRecord {
  hash: string;
  data: PrescriptionData;
  uploaderId: string;
  uploaderRole: Role;
  timestamp: string;
}

export interface IconProps {
  className?: string;
}

export interface QueuedPrescription {
    id?: number;
    file: File;
    uploaderId: string;
    uploaderRole: Role;
    queuedAt: string;
}