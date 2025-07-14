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
import { Loader2, Factory } from 'lucide-react';

const mncFormSchema = z.object({
  traceId: z.string().min(1, 'Trace ID is required'),
  qaStatus: z.string().min(1, 'QA Status is required'),
  processingDate: z.string().min(1, 'Processing date is required'),
  processingTime: z.string().min(1, 'Processing time is required'),
  packagingDate: z.string().min(1, 'Packaging date is required'),
  packagingTime: z.string().min(1, 'Packaging time is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  shipmentDate: z.string().min(1, 'Shipment date is required'),
  shipmentTime: z.string().min(1, 'Shipment time is required'),
});

type MNCFormData = z.infer<typeof mncFormSchema>;

interface MNCActivityFormProps {
  onSuccess?: () => void;
}

export function MNCActivityForm({ onSuccess }: MNCActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MNCFormData>({
    resolver: zodResolver(mncFormSchema),
    defaultValues: {
      traceId: '',
      qaStatus: '',
      processingDate: '',
      processingTime: '',
      packagingDate: '',
      packagingTime: '',
      expiryDate: '',
      shipmentDate: '',
      shipmentTime: '',
    },
  });

  const onSubmit = async (data: MNCFormData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to record activity',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify trace_id exists
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('id')
        .eq('trace_id', data.traceId)
        .single();

      if (batchError || !batchData) {
        throw new Error('Invalid trace ID. Please check and try again.');
      }

      // Combine dates and times
      const processingDateTime = new Date(`${data.processingDate}T${data.processingTime}`);
      const packagingDateTime = new Date(`${data.packagingDate}T${data.packagingTime}`);
      const shipmentDateTime = new Date(`${data.shipmentDate}T${data.shipmentTime}`);

      // Create MNC activities
      const activities = [
        {
          trace_id: data.traceId,
          actor_role: 'mnc' as const,
          actor_id: user.id,
          activity_type: 'qa_inspection',
          timestamp: new Date().toISOString(),
          extra_data: {
            qa_status: data.qaStatus,
          },
        },
        {
          trace_id: data.traceId,
          actor_role: 'mnc' as const,
          actor_id: user.id,
          activity_type: 'processing',
          timestamp: processingDateTime.toISOString(),
          extra_data: {
            qa_status: data.qaStatus,
          },
        },
        {
          trace_id: data.traceId,
          actor_role: 'mnc' as const,
          actor_id: user.id,
          activity_type: 'packaging',
          timestamp: packagingDateTime.toISOString(),
          extra_data: {
            expiry_date: data.expiryDate,
          },
        },
        {
          trace_id: data.traceId,
          actor_role: 'mnc' as const,
          actor_id: user.id,
          activity_type: 'shipment_to_retailer',
          timestamp: shipmentDateTime.toISOString(),
          extra_data: {
            expiry_date: data.expiryDate,
          },
        },
      ];

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activities);

      if (activityError) throw activityError;

      toast({
        title: 'MNC activities recorded successfully!',
        description: `Manufacturing process logged for trace ID: ${data.traceId}`,
      });

      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error('Error recording MNC activity:', error);
      toast({
        title: 'Error recording activity',
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
          <Factory className="h-5 w-5" />
          Log Manufacturing Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="traceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trace ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TR2025001001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qaStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QA Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select QA status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="conditional">Conditional Pass</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Processing</h3>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="processingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="processingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Packaging</h3>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="packagingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packagingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="font-medium text-sm">Shipment to Retailer</h3>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="shipmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Manufacturing Activity
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}