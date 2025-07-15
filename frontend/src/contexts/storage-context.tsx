import React, {createContext, useContext, useState} from "react";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
} from "@aws-sdk/client-s3";
import {getSignedUrl as getSignedUrlSDK} from "@aws-sdk/s3-request-presigner";
import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/auth-context";

interface StorageContextType {
    uploadFile: (file: File, path?: string) => Promise<string>;
    downloadFile: (key: string) => Promise<string>;
    deleteFile: (key: string) => Promise<boolean>;
    listFiles: (prefix?: string) => Promise<StorageFile[]>;
    getSignedUrl: (key: string, expiresIn?: number) => Promise<string>;
    loading: boolean;
    error: string | null;
}

interface StorageFile {
    key: string;
    lastModified: Date;
    size: number;
    type: string;
    url: string;
}

const StorageContext = createContext<StorageContextType>({
    uploadFile: async () => "",
    downloadFile: async () => "",
    deleteFile: async () => false,
    listFiles: async () => [],
    getSignedUrl: async () => "",
    loading: false,
    error: null,
});

export const useStorage = () => useContext(StorageContext);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {toast} = useToast();
    const {user} = useAuth();

    // Initialize S3 client
    const s3Client = new S3Client({
        region: import.meta.env.VITE_S3_REGION || "us-east-1",
        endpoint: import.meta.env.VITE_S3_ENDPOINT || "http://localhost:9000",
        credentials: {
            accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY || "minioadmin",
            secretAccessKey: import.meta.env.VITE_S3_SECRET_KEY || "minioadmin",
        },
        forcePathStyle: true, // Required for MinIO
    });

    const bucketName = import.meta.env.VITE_S3_BUCKET || "delivery-system";

    const uploadFile = async (file: File, path = ""): Promise<string> => {
        try {
            setLoading(true);
            setError(null);

            // Create a file key using path, user ID, and timestamp
            const userId = user?.id || "anonymous";
            const timestamp = new Date().getTime();
            const fileName = file.name.replace(/\s+/g, "-").toLowerCase();
            const key = path ? `${path}/${userId}_${timestamp}_${fileName}` : `${userId}_${timestamp}_${fileName}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: new Uint8Array(await file.arrayBuffer()),
                ContentType: file.type,
            });

            await s3Client.send(command);

            // Get a signed URL for immediate access
            await getSignedUrlSDK(s3Client, new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            }), {expiresIn: 3600});

            toast({
                title: "File Uploaded",
                description: "File has been uploaded successfully.",
            });

            return key;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to upload file";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: errorMessage,
            });
            return "";
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (key: string): Promise<string> => {
        try {
            setLoading(true);
            setError(null);

            const url = await getSignedUrlSDK(s3Client, new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            }), {expiresIn: 3600});

            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to download file";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: errorMessage,
            });
            return "";
        } finally {
            setLoading(false);
        }
    };

    const deleteFile = async (key: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            await s3Client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key
            }));

            toast({
                title: "File Deleted",
                description: "File has been deleted successfully.",
            });

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete file";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: errorMessage,
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const listFiles = async (prefix = ""): Promise<StorageFile[]> => {
        try {
            setLoading(true);
            setError(null);

            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
            });

            const response = await s3Client.send(command);

            if (!response.Contents) {
                return [];
            }

            const files = await Promise.all(
                response.Contents.map(async (item) => {
                    const url = await getSignedUrlSDK(s3Client, new GetObjectCommand({
                        Bucket: bucketName,
                        Key: item.Key || ""
                    }), {expiresIn: 3600});

                    return {
                        key: item.Key || "",
                        lastModified: item.LastModified || new Date(),
                        size: item.Size || 0,
                        type: item.Key?.split('.').pop() || "",
                        url,
                    };
                })
            );

            return files;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to list files";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "List Files Failed",
                description: errorMessage,
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getSignedUrl = async (key: string, expiresIn = 3600): Promise<string> => {
        try {
            const url = await getSignedUrlSDK(s3Client, new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            }), {expiresIn});

            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to generate signed URL";
            setError(errorMessage);
            return "";
        }
    };

    const value = {
        uploadFile,
        downloadFile,
        deleteFile,
        listFiles,
        getSignedUrl,
        loading,
        error,
    };

    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};