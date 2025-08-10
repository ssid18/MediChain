
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
    
    const isLicenseValid = /^\d{6,10}$/.test(details.licenseNumber);
    const isGovIdValid = /^(\d{12}|[A-Z]{5}[0-9]{4}[A-Z]{1})$/.test(details.governmentId);

    if (isLicenseValid && isGovIdValid) {
        console.log('Doctor details appear valid.');
        return;
    } else {
        const errorMessages = [];
        if (!isLicenseValid) errorMessages.push('Medical License must be 6-10 digits.');
        if (!isGovIdValid) errorMessages.push('Government ID format is invalid (Aadhaar/PAN).');
        throw new Error(errorMessages.join(' '));
    }
  }

  async verifyPharmacistDetails(details: PharmacistDetails): Promise<void> {
    console.log(`Verifying pharmacist details...`, details);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple mock validation for demonstration purposes
    const isLicenseValid = /^\d{6,10}$/.test(details.pharmacyLicenseNumber);
    const isGovIdValid = /^(\d{12}|[A-Z]{5}[0-9]{4}[A-Z]{1})$/.test(details.governmentId);

    if (isLicenseValid && isGovIdValid) {
        console.log('Pharmacist details appear valid.');
        return;
    } else {
        const errorMessages = [];
        if (!isLicenseValid) errorMessages.push('Pharmacy License format is invalid.');
        if (!isGovIdValid) errorMessages.push('Government ID format is invalid.');
        throw new Error(errorMessages.join(' '));
    }
  }
}

export const verificationService = new VerificationService();