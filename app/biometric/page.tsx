"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWeb3 } from "@/context/web3-context";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Fingerprint,
  Scan,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Types for WebAuthn
type PublicKeyCredentialCreationOptionsJSON = {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: string;
    alg: number;
  }[];
  timeout?: number;
  excludeCredentials?: {
    id: string;
    type: string;
    transports?: string[];
  }[];
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    userVerification?: string;
    requireResidentKey?: boolean;
  };
  attestation?: string;
};

type PublicKeyCredentialJSON = {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject?: string;
    clientDataJSON: string;
  };
};

export default function Biometric() {
  const { account } = useWeb3();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!account) {
      router.push("/");
    }
  }, [account, router]);

  // Helper to encode ArrayBuffer to Base64 string
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  // Helper to decode Base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleBiometricRegistration = async () => {
    try {
      setIsRegistering(true);
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      // 1. Generate server challenge (in a real app, this comes from your server)
      // This would typically be fetched from your backend
      const mockServerChallenge: PublicKeyCredentialCreationOptionsJSON = {
        challenge: arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32))),
        rp: {
          name: "Web3 Identity Platform",
          id: window.location.hostname
        },
        user: {
          id: account.replace("0x", ""),
          name: `user-${account.slice(0, 6)}`,
          displayName: `User ${account.slice(0, 6)}...${account.slice(-4)}`
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        timeout: 60000,
        authenticatorSelection: {
          authenticatorAttachment: "platform", // platform = built-in biometric
          userVerification: "required",
          requireResidentKey: false
        },
        attestation: "direct"
      };
      
      // 2. Convert server challenge to proper format
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64ToArrayBuffer(mockServerChallenge.challenge),
        rp: mockServerChallenge.rp,
        user: {
          id: Uint8Array.from(mockServerChallenge.user.id, c => c.charCodeAt(0)),
          name: mockServerChallenge.user.name,
          displayName: mockServerChallenge.user.displayName
        },
        pubKeyCredParams: mockServerChallenge.pubKeyCredParams,
        timeout: mockServerChallenge.timeout,
        authenticatorSelection: mockServerChallenge.authenticatorSelection,
        attestation: mockServerChallenge.attestation as AttestationConveyancePreference
      };
      
      // 3. Create credential
      toast.info("Please follow your device's biometric prompt");
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;
      
      // 4. Prepare credential for sending to server
      const credentialJSON: PublicKeyCredentialJSON = {
        id: credential.id,
        rawId: arrayBufferToBase64((credential.rawId as unknown) as ArrayBuffer),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64(
            (credential.response as AuthenticatorAttestationResponse).clientDataJSON
          ),
          attestationObject: arrayBufferToBase64(
            (credential.response as AuthenticatorAttestationResponse).attestationObject
          )
        }
      };
      
      // 5. Send to server (mock for now)
      console.log("Credential created:", credentialJSON);
      
      // In a real app, you would send this to your backend:
      // await fetch('/api/register-webauthn', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ credential: credentialJSON, userId: account })
      // });
      
      // Show success message
      toast.success("Biometric authentication configured successfully");
      
      // Store credential ID in localStorage for demo purposes
      // In a real app, this would be stored securely on your server
      localStorage.setItem(`webauthn-credential-${account}`, credential.id);
      
    } catch (error: any) {
      console.error("Biometric registration error:", error);
      toast.error(`Failed to configure biometric authentication: ${error?.message || "Unknown error"}`);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!account) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Biometric Authentication</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Configure Biometric Authentication
            </CardTitle>
            <CardDescription>
              Enhance your account security with biometric authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BiometricFeatureCard
                  icon={Fingerprint}
                  title="Fingerprint"
                  description="Use your device's fingerprint scanner"
                />
                <BiometricFeatureCard
                  icon={Scan}
                  title="Face ID"
                  description="Use facial recognition for authentication"
                />
                <BiometricFeatureCard
                  icon={Smartphone}
                  title="Device-based"
                  description="Use your device's secure enclave"
                />
              </div>

              <div className="flex flex-col items-center gap-4 pt-6">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <p className="text-center text-sm text-muted-foreground max-w-md">
                  Your biometric data never leaves your device. We use WebAuthn to
                  create secure, private credentials.
                </p>
                <Button
                  size="lg"
                  onClick={handleBiometricRegistration}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Configuring..." : "Configure Biometrics"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function BiometricFeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
      <Icon className="h-8 w-8 mb-2" />
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}