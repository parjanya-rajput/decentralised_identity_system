"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWeb3 } from "@/context/web3-context";
import { motion } from "framer-motion";
import { Wallet, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { DID_REGISTRY_ABI } from "../constants/abi";
import { toast } from "sonner";

export default function Home() {
  const { connectWallet, account, isConnecting, signer } = useWeb3();
  const [identity, setIdentity] = useState<any>(null);
  const [accessLogs, setAccessLogs] = useState<{ accessors: string[], timestamps: string[] }>({ accessors: [], timestamps: [] });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (account && signer) {
      loadIdentityAndLogs();
    }
  }, [account, signer]);

  const loadIdentityAndLogs = async () => {
    if (!account || !signer) return;

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );

      // First try to get identity
      try {
        const identityData = await contract.getIdentity(account);
        setIdentity(identityData);
        console.log("Identity loaded:", identityData);
      } catch (identityError) {
        console.error("Identity loading error:", identityError);
        setIdentity(null);
      }

      // Then try to get access logs
      try {
        setIsLoadingLogs(true);
        const logs = await contract.getAccessLogs();  // Remove account parameter
        console.log("Access Logs:", logs);
        setAccessLogs(logs);
      } catch (logsError) {
        console.error("Access logs loading error:", logsError);
        setAccessLogs({ accessors: [], timestamps: [] });
      }
    } catch (error) {
      console.error("Contract initialization error:", error);
      toast.error("Failed to initialize contract");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-6">
            Decentralized Identity Verification
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Take control of your digital identity with our secure, blockchain-based
            verification system
          </p>

          {!account ? (
            <Button
              size="lg"
              onClick={connectWallet}
              disabled={isConnecting}
              className="animate-pulse"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium">Wallet Address:</span>
                    </div>
                    <code className="bg-muted px-2 py-1 rounded">
                      {account}
                    </code>
                    
                    {identity && (
                      <div className="border-t pt-4 mt-4 text-left">
                        <h3 className="font-medium mb-2">Identity Information:</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {identity.name || "Not set"}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {identity.email || "Not set"}
                          </p>
                          <p>
                            <span className="font-medium">Location:</span>{" "}
                            {identity.location || "Not set"}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {identity.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <FeatureCard
            title="Self-Sovereign Identity"
            description="Create and manage your decentralized identity with full control over your personal data."
          />
          <FeatureCard
            title="Biometric Security"
            description="Enhanced security with biometric authentication using WebAuthn."
          />
          <FeatureCard
            title="Verifiable Credentials"
            description="Issue and verify digital credentials with blockchain-backed trust."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-lg bg-card shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}