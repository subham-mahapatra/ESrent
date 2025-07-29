'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCars } from '@/hooks/useApi';

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  originalPrice: number;
  discountedPrice?: number;
  available: boolean;
  featured: boolean;
  createdAt: string;
  category?: string; // Add this for backward compatibility
}

export default function AdminDashboard() {
  const carsParams = useMemo(() => ({ limit: 5 }), []);
  const { data: carsData, loading: carsLoading, error: carsError } = useCars(carsParams);
  
  const cars = carsData?.data || [];
  const loading = carsLoading;
  const error = carsError ? { error: 'Failed to fetch cars', details: carsError } : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-40 animate-pulse bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Cars List</h1>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error.error}</p>
              </div>
              {error.details && (
                <p className="text-sm text-destructive/80 ml-7">{error.details}</p>
              )}
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 p-4 bg-destructive/10 rounded-lg text-xs overflow-x-auto text-destructive">
                  {carsError}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold mb-3 text-card-foreground">Cars</h2>
            <p className="text-muted-foreground text-sm lg:text-base mb-4">Manage your car inventory</p>
            <a href="/admin/cars" className="inline-flex items-center text-primary hover:text-primary/80 hover:underline text-sm lg:text-base">
              Go to Cars
              <span className="ml-1">→</span>
            </a>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold mb-3 text-card-foreground">Brands</h2>
            <p className="text-muted-foreground text-sm lg:text-base mb-4">Manage car brands</p>
            <a href="/admin/brands" className="inline-flex items-center text-primary hover:text-primary/80 hover:underline text-sm lg:text-base">
              Go to Brands
              <span className="ml-1">→</span>
            </a>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold mb-3 text-card-foreground">Categories</h2>
            <p className="text-muted-foreground text-sm lg:text-base mb-4">Manage car categories</p>
            <a href="/admin/categories" className="inline-flex items-center text-primary hover:text-primary/80 hover:underline text-sm lg:text-base">
              Go to Categories
              <span className="ml-1">→</span>
            </a>
          </CardContent>
        </Card>
      </div>

      {cars.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold mb-4 text-card-foreground">Recent Cars</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Brand</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.length > 0 ? (
                    (cars as any as Car[]).slice(0, 5).map((car: Car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.id.slice(0, 8)}</TableCell>
                        <TableCell>{car.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{car.brand}</TableCell>
                        <TableCell className="hidden lg:table-cell">{car.category || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {car.discountedPrice && car.originalPrice ? (
                            <div className="flex flex-col items-end">
                              <span className="text-green-500">AED {car.discountedPrice.toLocaleString()}</span>
                              <span className="text-gray-400 text-sm line-through">AED {car.originalPrice.toLocaleString()}</span>
                            </div>
                          ) : car.originalPrice ? (
                            <span>AED {car.originalPrice.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-400">Price on request</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">No cars found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
