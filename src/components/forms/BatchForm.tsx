import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Upload, Camera } from 'lucide-react';

const batchFormSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productionDate: z.string().min(1, 'Production date is required'),
  productionTime: z.string().min(1, 'Production time is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  quantity: z.string().min(1, 'Quantity is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),
  quantityUnit: z.string().min(1, 'Unit is required'),
});

type BatchFormData = z.infer<typeof batchFormSchema>;

interface BatchFormProps {
  onSuccess?: () => void;
}

export function BatchForm({ onSuccess }: BatchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [weighingPhoto, setWeighingPhoto] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      productName: '',
      productionDate: '',
      productionTime: '',
      state: '',
      district: '',
      quantity: '',
      quantityUnit: 'kg',
    },
  });

  const handlePhotoUpload = (file: File, type: 'product' | 'weighing') => {
    if (file && file.type.startsWith('image/')) {
      if (type === 'product') {
        setProductPhoto(file);
      } else {
        setWeighingPhoto(file);
      }
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please select a valid image file',
        variant: 'destructive',
      });
    }
  };

  const uploadPhoto = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: BatchFormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a batch',
        variant: 'destructive',
      });
      return;
    }

    if (!productPhoto || !weighingPhoto) {
      toast({
        title: 'Photos required',
        description: 'Please upload both product and weighing photos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate IDs
      const { data: traceIdData } = await supabase.rpc('generate_trace_id');
      const { data: batchIdData } = await supabase.rpc('generate_batch_id');
      
      const traceId = traceIdData || `TR${Date.now()}`;
      const batchId = batchIdData || `BT${Date.now()}`;

      // Combine date and time
      const productionDateTime = new Date(`${data.productionDate}T${data.productionTime}`);

      // Upload photos
      const timestamp = Date.now();
      const productPhotoPath = `${traceId}/product_${timestamp}.${productPhoto.name.split('.').pop()}`;
      const weighingPhotoPath = `${traceId}/weighing_${timestamp}.${weighingPhoto.name.split('.').pop()}`;

      const [productPhotoUrl, weighingPhotoUrl] = await Promise.all([
        uploadPhoto(productPhoto, 'product-photos', productPhotoPath),
        uploadPhoto(weighingPhoto, 'weighing-photos', weighingPhotoPath)
      ]);

      // Create batch record
      const { error: batchError } = await supabase
        .from('batches')
        .insert({
          trace_id: traceId,
          batch_id: batchId,
          product_name: data.productName,
          farmer_id: user.id,
          production_date: productionDateTime.toISOString(),
          location_state: data.state,
          location_district: data.district,
          quantity: parseFloat(data.quantity),
          quantity_unit: data.quantityUnit,
        });

      if (batchError) throw batchError;

      // Create media records
      const mediaRecords = [
        {
          trace_id: traceId,
          type: 'product_photo',
          photo_url: productPhotoUrl,
          timestamp: new Date().toISOString(),
        },
        {
          trace_id: traceId,
          type: 'weighing_photo',
          photo_url: weighingPhotoUrl,
          timestamp: new Date().toISOString(),
        }
      ];

      const { error: mediaError } = await supabase
        .from('media')
        .insert(mediaRecords);

      if (mediaError) throw mediaError;

      toast({
        title: 'Batch created successfully!',
        description: `Trace ID: ${traceId}, Batch ID: ${batchId}`,
      });

      form.reset();
      setProductPhoto(null);
      setWeighingPhoto(null);
      onSuccess?.();

    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: 'Error creating batch',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Create New Batch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic Tomatoes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="productionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pune" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="tonnes">Tonnes</SelectItem>
                        <SelectItem value="quintals">Quintals</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Photo</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'product')}
                        className="hidden"
                        id="product-photo"
                      />
                      <label htmlFor="product-photo" className="cursor-pointer text-sm text-primary hover:underline">
                        Click to upload product photo
                      </label>
                      {productPhoto && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {productPhoto.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Weighing Photo</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'weighing')}
                        className="hidden"
                        id="weighing-photo"
                      />
                      <label htmlFor="weighing-photo" className="cursor-pointer text-sm text-primary hover:underline">
                        Click to upload weighing photo
                      </label>
                      {weighingPhoto && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {weighingPhoto.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Batch
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}