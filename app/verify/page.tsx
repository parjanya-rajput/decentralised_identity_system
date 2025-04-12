"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3 } from "@/context/web3-context";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Scan, Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { DID_REGISTRY_ABI } from "@/constants/abi";

export default function Verify() {
  const { account, signer } = useWeb3();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generate" | "scan" | "lookup">("generate");
  const [isLoading, setIsLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [lookupAddress, setLookupAddress] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  const getIdentityAndLogData = async (address: string) => {
    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );
      
      // Call the contract and wait for the transaction
      const transaction = await contract.getIdentityAndLog(address);
      const identity = await transaction.wait();

      // Get the actual identity data after transaction is confirmed
      const identityData = await contract.getIdentity(address);

      // Check if identity is active
      if (!identityData.isActive) {
        return null;
      }

      return identityData;
    } catch (error: any) {
      console.error("Error fetching identity data:", error);
      // Check if the error is due to non-existent identity
      if (error?.message?.includes("Identity does not exist")) {
        toast.error("No identity found for this address");
      } else {
        toast.error("Failed to fetch identity data");
      }
      return null;
    }
  };

  const DisplayIdentityInfo = ({ address }: { address: string }) => {
    const [identity, setIdentity] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchIdentity = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const identityData = await getIdentityAndLogData(address);
          if (identityData) {
            setIdentity(identityData);
          } else {
            setError("No active identity found for this address");
          }
        } catch (err) {
          setError("Failed to fetch identity data");
        } finally {
          setIsLoading(false);
        }
      };

      if (address) {
        fetchIdentity();
      }
    }, [address]);

    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <p className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></p>
          <p>Verifying identity...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-destructive">
          <p>{error}</p>
        </div>
      );
    }

    if (!identity) {
      return null;
    }

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            Verified
          </span>
          <span className="text-xs text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>

        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold">Identity Information</h3>
          <div className="space-y-2">
            {identity.name ? (
              <div className="flex justify-between border-b pb-1">
                <span className="font-medium">Name</span>
                <span>{identity.name}</span>
              </div>
            ) : (
              <div className="flex justify-between border-b pb-1 text-muted-foreground">
                <span>Name</span>
                <span>Not shared</span>
              </div>
            )}

            {identity.email ? (
              <div className="flex justify-between border-b pb-1">
                <span className="font-medium">Email</span>
                <span>{identity.email}</span>
              </div>
            ) : (
              <div className="flex justify-between border-b pb-1 text-muted-foreground">
                <span>Email</span>
                <span>Not shared</span>
              </div>
            )}

            {identity.location ? (
              <div className="flex justify-between border-b pb-1">
                <span className="font-medium">Location</span>
                <span>{identity.location}</span>
              </div>
            ) : (
              <div className="flex justify-between border-b pb-1 text-muted-foreground">
                <span>Location</span>
                <span>Not shared</span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-1">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(Number(identity.createdAt) * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleVerifyAddress = async () => {
    if (!ethers.isAddress(lookupAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setIsVerifying(true);
    try {
      const identityData = await getIdentityAndLogData(lookupAddress);
      if (identityData) {
        setScannedAddress(lookupAddress);
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!account) {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    }
  }, [account, router]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) {
        const svg = qrRef.current.querySelector("svg");
        if (!svg) {
          throw new Error("QR code element not found");
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const DOMURL = window.URL || window.webkitURL || window;
        const url = DOMURL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `did-verification-${account?.slice(0, 6)}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        DOMURL.revokeObjectURL(url);
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `did-verification-${account?.slice(0, 6)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p>Loading verification tools...</p>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Verify Credentials</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="generate">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Scan className="mr-2 h-4 w-4" />
              Scan QR
            </TabsTrigger>
            <TabsTrigger value="lookup">
              <Search className="mr-2 h-4 w-4" />
              Lookup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Verification QR Code</CardTitle>
                <CardDescription>
                  Create a QR code to share your verified credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div ref={qrRef} className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG
                    value={`did:ethr:${account}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <Button onClick={downloadQRCode}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  This QR code contains your decentralized identity and can be used for secure
                  verification.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>
                  {scannedAddress ? "Verification Results" : "Scan QR Code"}
                </CardTitle>
                <CardDescription>
                  {scannedAddress
                    ? "Viewing identity information"
                    : "Scan a QR code to verify credentials"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-auto">
                  {scannedAddress ? (
                    <DisplayIdentityInfo address={scannedAddress} />
                  ) : (
                    <p className="text-muted-foreground">Camera feed will appear here</p>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setScannedAddress("0x123...");
                  }}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  {scannedAddress ? "Scan Another" : "Request Camera Access"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lookup">
            <Card>
              <CardHeader>
                <CardTitle>Lookup Identity</CardTitle>
                <CardDescription>
                  Enter an Ethereum address to verify its identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Enter Ethereum address"
                    value={lookupAddress}
                    onChange={(e) => setLookupAddress(e.target.value)}
                    disabled={isVerifying}
                  />
                  <Button
                    className="w-full relative"
                    onClick={handleVerifyAddress}
                    disabled={isVerifying || !lookupAddress}
                  >
                    {isVerifying ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Verify Address
                  </Button>
                </div>
                {scannedAddress && <DisplayIdentityInfo address={scannedAddress} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
