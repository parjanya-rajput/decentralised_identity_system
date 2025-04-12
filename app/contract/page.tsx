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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useWeb3 } from "@/context/web3-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { ArrowLeft, FileKey, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { DID_REGISTRY_ABI } from "@/constants/abi";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

export default function Contract() {
  const { account, signer } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState<any>(null);
  const [nameConsent, setNameConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
    },
  });

  useEffect(() => {
    // Add a small delay to ensure web3 context is properly initialized
    const timer = setTimeout(() => {
      if (!account) {
        router.push("/");
      } else {
        loadIdentity();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [account, router]);

  const loadIdentity = async () => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );

      const identity = await contract.getIdentity(account);
      setIdentity(identity);

      // Load consent status
      const nameConsent = await contract.checkConsent(account, "name");
      const emailConsent = await contract.checkConsent(account, "email");
      const locationConsent = await contract.checkConsent(account, "location");

      setNameConsent(nameConsent);
      setEmailConsent(emailConsent);
      setLocationConsent(locationConsent);

      if (identity.isActive) {
        form.reset({
          name: identity.name,
          email: identity.email,
          location: identity.location,
        });
      }
    } catch (error) {
      console.error("Error loading identity:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );

      const tx = identity?.isActive
        ? await contract.updateIdentity(values.name, values.email, values.location)
        : await contract.registerIdentity(
            values.name,
            values.email,
            values.location
          );

      await tx.wait();
      toast.success(
        identity?.isActive
          ? "Identity updated successfully"
          : "Identity registered successfully"
      );
      await loadIdentity();
    } catch (error) {
      console.error("Error submitting identity:", error);
      toast.error("Failed to submit identity");
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (attribute: string, status: boolean) => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );

      const tx = await contract.updateConsent(attribute, status);
      await tx.wait();
      toast.success("Consent updated successfully");
      await loadIdentity();
    } catch (error) {
      console.error("Error updating consent:", error);
      toast.error("Failed to update consent");
    }
  };

  const deactivateIdentity = async () => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DID_REGISTRY_ADDRESS || "",
        DID_REGISTRY_ABI,
        signer
      );

      const tx = await contract.deactivateIdentity();
      await tx.wait();
      toast.success("Identity deactivated successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deactivating identity:", error);
      toast.error("Failed to deactivate identity");
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
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Smart Contract Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              {identity?.isActive ? "Update Identity" : "Register Identity"}
            </CardTitle>
            <CardDescription>
              Manage your decentralized identity on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Name Consent</FormLabel>
                      <FormDescription>
                        Allow others to view your name
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={nameConsent}
                        onCheckedChange={(checked) =>
                          updateConsent("name", checked)
                        }
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Consent</FormLabel>
                      <FormDescription>
                        Allow others to view your email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={emailConsent}
                        onCheckedChange={(checked) =>
                          updateConsent("email", checked)
                        }
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Location Consent</FormLabel>
                      <FormDescription>
                        Allow others to view your location
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={locationConsent}
                        onCheckedChange={(checked) =>
                          updateConsent("location", checked)
                        }
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Processing..."
                  ) : identity?.isActive ? (
                    "Update Identity"
                  ) : (
                    "Register Identity"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {identity?.isActive && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently deactivate your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={deactivateIdentity}
                disabled={loading}
              >
                Deactivate Identity
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}