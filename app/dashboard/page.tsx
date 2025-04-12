"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/context/web3-context";
import { motion } from "framer-motion";
import {
  FileKey,
  Fingerprint,
  QrCode,
  Shield,
  Sparkles,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccessLogs } from "@/components/AccessLogs";

function DashboardCard({
  title,
  icon: Icon,
  href,
  description,
  gradient,
}: {
  title: string;
  icon: any;
  href: string;
  description: string;
  gradient: string;
}) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={() => router.push(href)}
    >
      <Card className="h-full overflow-hidden border border-border/40 shadow-md">
        <div className={`h-2 ${gradient}`} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-full bg-secondary/30">
              <Icon className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-5">{description}</p>
          <Button
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(href);
            }}
          >
            Access
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { account } = useWeb3();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsLoading(false);
        if (!account) {
          router.push("/");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [account, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-64 w-full max-w-4xl bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your digital identity and credentials</p>
          </div>
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="rounded-full p-3"
              onClick={() => router.push("/profile")}
              title="View Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="hover:bg-muted/30 transition-all duration-300 cursor-pointer border-border/40 shadow-md"
              onClick={() => router.push("/contract")}
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
              <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileKey className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Contract Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your identity contract and consent settings
                </p>
                <div className="mt-4 text-xs p-2 bg-muted/50 rounded-md flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                  <span>Primary identity control center</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DashboardCard
              title="Biometric Setup"
              icon={Fingerprint}
              href="/biometric"
              description="Configure biometric authentication"
              gradient="bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DashboardCard
              title="Credentials"
              icon={Shield}
              href="/credentials"
              description="Manage your verifiable credentials"
              gradient="bg-gradient-to-r from-orange-500 to-amber-500"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-1"
          >
            <DashboardCard
              title="Verify"
              icon={QrCode}
              href="/verify"
              description="Verify credentials and identities using QR codes"
              gradient="bg-gradient-to-r from-rose-500 to-red-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="md:col-span-2"
          >
            <AccessLogs contractAddress={process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || ''} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
