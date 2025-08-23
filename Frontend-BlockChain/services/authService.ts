
import type { User, Role, PharmacistRegistrationData, DoctorRegistrationData } from '../types';
import { verificationService } from './verificationService';
import { Role as RoleEnum } from '../types';

const SESSION_USER_KEY = 'medi_chain_user_session';
const USERS_DB_KEY = 'medi_chain_users_db';

// A simple hashing function for the demo. In a real app, use a strong library like bcrypt.
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}


class AuthService {
  constructor() {
    this.seedAdminUser();
  }

  private async seedAdminUser() {
    const users = this.getUsers();
    const adminExists = users.some(u => u.role === RoleEnum.Admin);
    if (!adminExists) {
        console.log('No admin user found. Seeding default admin...');
        const passwordHash = await hashPassword('admin123');
        const adminUser: User & { passwordHash: string } = {
            id: 'admin-001',
            username: 'admin',
            role: RoleEnum.Admin,
            passwordHash,
            fullName: 'System Administrator'
        };
        this.saveUsers([...users, adminUser]);
        console.log('Default admin seeded. Username: admin, Password: admin123');
    }
  }
    
  private getUsers(): (User & { passwordHash: string })[] {
    const usersJson = localStorage.getItem(USERS_DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: (User & { passwordHash: string })[]): void {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }
  
  async login(username: string, password: string): Promise<User> {
    console.log(`Attempting login for username: ${username}`);
    const users = this.getUsers();
    console.log(`Total users in database: ${users.length}`);
    
    const userRecord = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!userRecord) {
        console.error(`User not found: ${username}`);
        throw new Error('User not found. Please check your username or sign up.');
    }

    console.log(`User found: ${userRecord.username}, role: ${userRecord.role}`);
    const passwordHash = await hashPassword(password);

    if (userRecord.passwordHash !== passwordHash) {
        console.error(`Password mismatch for user: ${username}`);
        throw new Error('Invalid password.');
    }
    
    console.log(`Login successful for user: ${username}, role: ${userRecord.role}`);
    // Return a clean user object without the password hash
    const { passwordHash: _, ...sessionUser } = userRecord;
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  }

  async registerDoctor(data: DoctorRegistrationData): Promise<void> {
    const { username, password, licenseNumber, governmentId, clinicName } = data;
    if (!username || !password || !licenseNumber || !governmentId || !clinicName) {
        throw new Error('Missing required doctor registration details.');
    }

    // Verify details first
    if(!licenseNumber || !governmentId) {
        throw new Error('License Number and Government ID are required for verification.');
    }
    await verificationService.verifyDoctorDetails({ licenseNumber, governmentId });

    const users = this.getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        throw new Error('Username is already taken. Please choose another one.');
    }
    
    const passwordHash = await hashPassword(password);

    const newUser: User & { passwordHash: string } = {
      id: `${username}-${Date.now()}`,
      username: data.username,
      role: RoleEnum.Doctor,
      passwordHash,
      fullName: data.fullName,
      licenseNumber: data.licenseNumber,
      governmentId: data.governmentId,
      email: data.email,
      phoneNumber: data.phoneNumber,
      clinicName: data.clinicName,
      physicalAddress: data.physicalAddress,
    };

    this.saveUsers([...users, newUser]);
    // Does not log in, user must go to login page.
  }

  async registerPharmacist(data: PharmacistRegistrationData): Promise<void> {
    console.log('Starting pharmacist registration...', { username: data.username, pharmacyName: data.pharmacyName });
    const { username, password, pharmacyLicenseNumber, governmentId } = data;
    if (!username || !password || !pharmacyLicenseNumber || !governmentId) {
        console.error('Missing required fields:', { username: !!username, password: !!password, pharmacyLicenseNumber: !!pharmacyLicenseNumber, governmentId: !!governmentId });
        throw new Error('Missing required pharmacist registration details.');
    }

    // Verify details first
    if(!pharmacyLicenseNumber || !governmentId) {
        console.error('License or Government ID missing');
        throw new Error('Pharmacy License and Government ID are required for verification.');
    }
    
    console.log('Verifying pharmacist details...');
    await verificationService.verifyPharmacistDetails({ pharmacyLicenseNumber, governmentId });
    console.log('Verification successful');

    const users = this.getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        console.error('Username already exists:', username);
        throw new Error('Username is already taken. Please choose another one.');
    }
    
    const passwordHash = await hashPassword(password);

    const newUser: User & { passwordHash: string } = {
      id: `${username}-${Date.now()}`,
      username: data.username,
      role: RoleEnum.Pharmacist,
      passwordHash,
      fullName: data.fullName,
      pharmacyName: data.pharmacyName,
      pharmacyLicenseNumber: data.pharmacyLicenseNumber,
      governmentId: data.governmentId,
      email: data.email,
      phoneNumber: data.phoneNumber,
      physicalAddress: data.physicalAddress,
    };

    console.log('Creating new pharmacist user:', { id: newUser.id, username: newUser.username, role: newUser.role });
    this.saveUsers([...users, newUser]);
    console.log('Pharmacist registration completed successfully');
    // Does not log in, user must go to login page.
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_USER_KEY);
  }

  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(SESSION_USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
        return null;
      }
    }
    return null;
  }

  getVerifiedDoctors(): User[] {
    const users = this.getUsers();
    return users.filter(user => user.role === RoleEnum.Doctor);
  }
}

export const authService = new AuthService();