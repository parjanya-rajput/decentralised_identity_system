"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/context/web3-context";
import { DID_REGISTRY_ABI } from "@/constants/abi";
import { motion } from "framer-motion";
import { History, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "./ui/button";

interface AccessLog {
    accessor: string;
    timestamp: Date;
}

export function AccessLogs({ contractAddress }: { contractAddress: string }) {
    const { signer } = useWeb3();
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!signer || !contractAddress) return;

            try {
                setIsLoading(true);
                setError(null);

                const contract = new ethers.Contract(
                    contractAddress,
                    DID_REGISTRY_ABI,
                    signer
                );

                const [accessors, timestamps] = await contract.getAccessLogs();

                const formattedLogs = accessors.map((accessor: string, index: number) => ({
                    accessor,
                    timestamp: new Date(Number(timestamps[index]) * 1000)
                }));

                setLogs(formattedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
            } catch (error: any) {
                console.error("Error fetching access logs:", error);
                setError(error?.message || "Failed to fetch access logs");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [signer, contractAddress]);

    const openEtherscan = (address: string) => {
        window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
    };

    if (error) {
        return (
            <Card className="border border-border/40 shadow-md">
                <div className="h-2 bg-gradient-to-r from-red-400 to-rose-400" />
                <CardContent className="pt-6">
                    <p className="text-sm text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border/40 shadow-md">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400" />
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-full bg-secondary/30">
                            <History className="h-5 w-5" />
                        </div>
                        Access History
                    </div>
                    {!isLoading && logs.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                            Total: {logs.length}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-12 bg-muted rounded-lg" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No access logs found</p>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log, index) => (
                            <motion.div
                                key={`${log.accessor}-${log.timestamp.getTime()}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 rounded-lg bg-secondary/10 flex items-center justify-between"
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {log.accessor.substring(0, 6)}...{log.accessor.substring(38)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4"
                                            onClick={() => openEtherscan(log.accessor)}
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {log.timestamp.toLocaleString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}