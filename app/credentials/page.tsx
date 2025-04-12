"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useWeb3 } from "@/context/web3-context";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Shield, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Credentials() {
  const { account } = useWeb3();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      if (!account) {
        router.push("/");
      } else {
        // Load credentials data here if needed
        // For now just setting loading to false
        setIsLoading(false);
      }
    }
  }, [account, router]);

  // Early return with loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p>Loading credentials...</p>
        </div>
      </div>
    );
  }

  // Authentication guard
  if (!account) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Credentials Management</h1>
        </div>

        <Tabs defaultValue="my-credentials">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-credentials">My Credentials</TabsTrigger>
            <TabsTrigger value="issue-credentials">Issue Credentials</TabsTrigger>
          </TabsList>

          <TabsContent value="my-credentials" className="space-y-4 mt-4">
            {/* Check if there are credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CredentialCard
                title="Identity Verification"
                status="Verified"
                issuer="Government Authority"
                expiryDate="2025-12-31"
              />
              <CredentialCard
                title="Employment Status"
                status="Pending"
                issuer="Current Employer"
                expiryDate="2024-12-31"
              />
            </div>
          </TabsContent>

          <TabsContent value="issue-credentials" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Issue New Credential</CardTitle>
                <CardDescription>
                  Create and issue verifiable credentials to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => toast.info("Credential creation coming soon")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Credential
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function CredentialCard({
  title,
  status,
  issuer,
  expiryDate,
}: {
  title: string;
  status: "Verified" | "Pending";
  issuer: string;
  expiryDate: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "Verified" ? (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          ) : (
            <Shield className="h-5 w-5 text-yellow-500" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{issuer}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span
              className={
                status === "Verified"
                  ? "text-sm text-green-500"
                  : "text-sm text-yellow-500"
              }
            >
              {status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Expires</span>
            <span className="text-sm">{expiryDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}