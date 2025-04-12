# Decentralized Identity System

A self-sovereign identity management system built on Ethereum blockchain using Next.js and WebAuthn for biometric authentication.

## Description

This dApp enables users to create and manage their decentralized identities with complete control over their personal data. It leverages blockchain technology for data integrity and biometric authentication for enhanced security.

## Key Features

- **Self-Sovereign Identity Management**
  - Create and control your decentralized identity
  - Manage personal information (name, email, location)
  - Fine-grained consent management for data sharing

- **Biometric Authentication**
  - WebAuthn integration for secure authentication
  - Support for fingerprint and Face ID
  - Device-based authentication using secure enclave

- **Verifiable Credentials**
  - Issue and verify digital credentials
  - QR code-based verification system
  - Blockchain-backed trust and authenticity

- **Access Control & Monitoring**
  - Track identity access history
  - View detailed access logs
  - Etherscan integration for transaction verification

## Screenshots

### Homepage & Identity Management
![Homepage](1.png)
![Dashboard](2.png)
![Identity Registration](3.png)

### Biometric Setup
![Biometric Setup](4.png)
![Biometric Configuration](5.png)
![Authentication Process](6.png)

### Credential Management
![Credentials Dashboard](7.png)
![Credential Issuance](8.png)
![Verification Process](9.png)

### Access Control
![Access Logs](10.png)
![Consent Management](11.png)
![Security Features](12.png)

### Additional Features
![Feature 1](13.png)
![Feature 2](14.png)
![Feature 3](15.png)

### Etherscan Integration
![Etherscan Verification](16.png)

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/decentralised_identity_system.git
cd decentralised_identity_system
```

2. Install Dependencies
```bash
pnpm install
```

3. Create .env file in root directory with:
```
NEXT_PUBLIC_DID_REGISTRY_ADDRESS=0x5c5D3db374795C7869F440FF2B90a10848923c07```

4. Run the Development Server
``` pnpm run dev ```

## Technologies Used
- Next.js 13
- TypeScript
- Ethereum / Ethers.js
- WebAuthn
- Tailwind CSS
- Framer Motion
- Shadcn UI

## Network Information
This dApp is deployed on the Sepolia testnet. Make sure your wallet is configured to use the Sepolia network.

## License
MIT