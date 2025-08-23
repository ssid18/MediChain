
// This is a mock service to simulate verifying a professional's credentials.
// In a real application, this would make an API call to a secure,
// trusted third-party medical registry.

const VALID_DOCTOR_LICENSE_NUMBERS = [
    'DOC-12345-AB',
    'MD-98765-XY',
    'GP-45678-CA',
    'SUR-32109-TX',
    'PED-55555-FL',
];

// Add valid pharmacist license numbers for demo purposes
const VALID_PHARMACIST_LICENSE_NUMBERS = [
    'PHAR-12345',
    'PHAR-67890',
    'PHAR-11111',
    'PHAR-22222',
    'PHAR-33333',
];

interface DoctorDetails {
    licenseNumber: string;
    governmentId: string;
}

interface PharmacistDetails {
    pharmacyLicenseNumber: string;
    governmentId: string;
}

class VerificationService {
  async verifyLicense(licenseNumber: string): Promise<void> {
    console.log(`Verifying doctor license: ${licenseNumber}...`);
    
    // Simulate network delay for the API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (VALID_DOCTOR_LICENSE_NUMBERS.includes(licenseNumber.trim())) {
      console.log(`License ${licenseNumber} is valid.`);
      return; // Resolve promise, verification successful
    } else {
      console.error(`License ${licenseNumber} is invalid.`);
      throw new Error('Invalid or unrecognized medical license number.');
    }
  }

  async verifyDoctorDetails(details: DoctorDetails): Promise<void> {
    console.log(`Verifying doctor details...`, details);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // More lenient validation for demo purposes
    const isLicenseValid = details.licenseNumber.trim().length >= 3;
    const isGovIdValid = details.governmentId.trim().length >= 8;

    if (isLicenseValid && isGovIdValid) {
        console.log('Doctor details appear valid.');
        return;
    } else {
        const errorMessages = [];
        if (!isLicenseValid) errorMessages.push('Medical License must be at least 3 characters long.');
        if (!isGovIdValid) errorMessages.push('Government ID must be at least 8 characters long.');
        throw new Error(errorMessages.join(' '));
    }
  }

  async verifyPharmacistDetails(details: PharmacistDetails): Promise<void> {
    console.log(`Verifying pharmacist details...`, details);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // More lenient validation for demo purposes - allow any reasonable format
    const isLicenseValid = details.pharmacyLicenseNumber.trim().length >= 3;
    const isGovIdValid = details.governmentId.trim().length >= 8;

    if (isLicenseValid && isGovIdValid) {
        console.log('Pharmacist details appear valid.');
        return;
    } else {
        const errorMessages = [];
        if (!isLicenseValid) errorMessages.push('Pharmacy License must be at least 3 characters long.');
        if (!isGovIdValid) errorMessages.push('Government ID must be at least 8 characters long.');
        throw new Error(errorMessages.join(' '));
    }
  }
}

export const verificationService = new VerificationService();