import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Store } from 'lucide-react';

const retailerFormSchema = z.object({
  traceId: z.string().min(1, 'Trace ID is required'),
  shelfDate: z.string().min(1, 'Shelf placement date is required'),
  shelfTime: z.string().min(1, 'Shelf placement time is required'),
  soldDate: z.string().optional(),
  soldTime: z.string().optional(),
});

type RetailerFormData = z.infer<typeof retailerFormSchema>;

interface RetailerActivityFormProps {
  onSuccess?: () => void;
}

export function RetailerActivityForm({ onSuccess }: RetailerActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<RetailerFormData>({
    resolver: zodResolver(retailerFormSchema),
    defaultValues: {
      traceId: '',
      shelfDate: '',
      shelfTime: '',
      soldDate: '',
      soldTime: '',
    },
  });

  const onSubmit = async (data: RetailerFormData) => {
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
      const shelfDateTime = new Date(`${data.shelfDate}T${data.shelfTime}`);
      
      // Create retailer activities
      const activities = [
        {
          trace_id: data.traceId,
          actor_role: 'retailer' as const,
          actor_id: user.id,
          activity_type: 'placed_on_shelf',
          timestamp: shelfDateTime.toISOString(),
          extra_data: {},
        }
      ];

      // Add sold activity if dates are provided
      if (data.soldDate && data.soldTime) {
        const soldDateTime = new Date(`${data.soldDate}T${data.soldTime}`);
        
        // Calculate shelf duration
        const shelfDurationHours = Math.round((soldDateTime.getTime() - shelfDateTime.getTime()) / (1000 * 60 * 60));
        
        activities.push({
          trace_id: data.traceId,
          actor_role: 'retailer' as const,
          actor_id: user.id,
          activity_type: 'product_sold',
          timestamp: soldDateTime.toISOString(),
          extra_data: {
            shelf_duration_hours: shelfDurationHours,
          },
        });
      }

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activities);

      if (activityError) throw activityError;

      const message = data.soldDate && data.soldTime 
        ? `Product shelf placement and sale recorded for trace ID: ${data.traceId}`
        : `Product shelf placement recorded for trace ID: ${data.traceId}`;

      toast({
        title: 'Retailer activities recorded successfully!',
        description: message,
      });

      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error('Error recording retailer activity:', error);
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
          <Store className="h-5 w-5" />
          Log Retail Activity
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

            <div className="space-y-4">
              <h3 className="font-medium text-sm">Product Placed on Shelf</h3>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="shelfDate"
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
                  name="shelfTime"
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
              <h3 className="font-medium text-sm">Product Sold (Optional)</h3>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="soldDate"
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
                  name="soldTime"
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
              <p className="text-xs text-muted-foreground">
                Leave empty if product hasn't been sold yet. You can update this information later.
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Retail Activity
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}