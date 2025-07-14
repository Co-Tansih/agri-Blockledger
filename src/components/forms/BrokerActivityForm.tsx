import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Package } from 'lucide-react';

const brokerFormSchema = z.object({
  traceId: z.string().min(1, 'Trace ID is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  receivedTime: z.string().min(1, 'Received time is required'),
  storageStartDate: z.string().min(1, 'Storage start date is required'),
  storageStartTime: z.string().min(1, 'Storage start time is required'),
  storageEndDate: z.string().min(1, 'Storage end date is required'),
  storageEndTime: z.string().min(1, 'Storage end time is required'),
  remarks: z.string().optional(),
});

type BrokerFormData = z.infer<typeof brokerFormSchema>;

interface BrokerActivityFormProps {
  onSuccess?: () => void;
}

export function BrokerActivityForm({ onSuccess }: BrokerActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BrokerFormData>({
    resolver: zodResolver(brokerFormSchema),
    defaultValues: {
      traceId: '',
      receivedDate: '',
      receivedTime: '',
      storageStartDate: '',
      storageStartTime: '',
      storageEndDate: '',
      storageEndTime: '',
      remarks: '',
    },
  });

  const onSubmit = async (data: BrokerFormData) => {
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
      const receivedDateTime = new Date(`${data.receivedDate}T${data.receivedTime}`);
      const storageStartDateTime = new Date(`${data.storageStartDate}T${data.storageStartTime}`);
      const storageEndDateTime = new Date(`${data.storageEndDate}T${data.storageEndTime}`);

      // Create broker activities
      const activities = [
        {
          trace_id: data.traceId,
          actor_role: 'broker' as const,
          actor_id: user.id,
          activity_type: 'product_received',
          timestamp: receivedDateTime.toISOString(),
          extra_data: {
            remarks: data.remarks,
          },
        },
        {
          trace_id: data.traceId,
          actor_role: 'broker' as const,
          actor_id: user.id,
          activity_type: 'storage_start',
          timestamp: storageStartDateTime.toISOString(),
          extra_data: {
            remarks: data.remarks,
          },
        },
        {
          trace_id: data.traceId,
          actor_role: 'broker' as const,
          actor_id: user.id,
          activity_type: 'storage_end',
          timestamp: storageEndDateTime.toISOString(),
          extra_data: {
            remarks: data.remarks,
          },
        },
      ];

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activities);

      if (activityError) throw activityError;

      toast({
        title: 'Broker activities recorded successfully!',
        description: `Activities logged for trace ID: ${data.traceId}`,
      });

      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error('Error recording broker activity:', error);
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
          <Package className="h-5 w-5" />
          Log Broker Activity
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Product Received</h3>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="receivedDate"
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
                    name="receivedTime"
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
                <h3 className="font-medium text-sm">Storage Period</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="storageStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storageStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="storageEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="storageEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Broker Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes about handling, quality, or storage conditions..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Broker Activity
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}