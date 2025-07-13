'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BrandDialog } from '@/components/admin/brand-dialog';
import { StatusModal } from '@/components/admin/status-modal';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useBrands } from '@/hooks/useApi';
import { frontendServices } from '@/lib/services/frontendServices';
import { useAuth } from '@/hooks/useApi';

export default function AdminBrands() {
  const { user, token, isInitialized } = useAuth();
  const { data, loading, error, refetch } = useBrands();
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    status: 'success' | 'error';
  }>({
    open: false,
    title: '',
    description: '',
    status: 'success',
  });

  // Brands list from API
  const brands = data?.data || [];

  const handleSaveBrand = async (brandData: Partial<Brand>) => {
    try {
      if (!token) throw new Error('Not authenticated');
      if (selectedBrand && selectedBrand.id) {
        // Update existing brand
        await frontendServices.updateBrand(selectedBrand.id, brandData, token);
        setStatusModal({
          open: true,
          title: 'Brand Updated',
          description: 'The brand has been updated successfully.',
          status: 'success',
        });
      } else {
        // Create new brand
        await frontendServices.createBrand(brandData, token);
        setStatusModal({
          open: true,
          title: 'Brand Created',
          description: 'The brand has been created successfully.',
          status: 'success',
        });
      }
      setDialogOpen(false);
      setSelectedBrand(undefined);
      refetch();
    } catch (error) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the brand.',
        status: 'error',
      });
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand || !selectedBrand.id) return;
    try {
      if (!token) throw new Error('Not authenticated');
      await frontendServices.deleteBrand(selectedBrand.id, token);
      setStatusModal({
        open: true,
        title: 'Brand Deleted',
        description: 'The brand has been deleted successfully.',
        status: 'success',
      });
      setDeleteDialogOpen(false);
      setSelectedBrand(undefined);
      refetch();
    } catch (error) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the brand.',
        status: 'error',
      });
    }
  };

  if (loading || !isInitialized) {
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show 'No data found' if brands is empty
  if (brands.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground text-lg">No brands found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Brands</h1>
        <Button
          onClick={() => {
            setSelectedBrand(undefined);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Car Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand: Brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.logo ? (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground">No logo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>{brand.slug}</TableCell>
                  <TableCell>{brand.featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{brand.carCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBrand(brand);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <BrandDialog
        brand={selectedBrand}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveBrand}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this brand? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBrand}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <StatusModal
        open={statusModal.open}
        title={statusModal.title}
        description={statusModal.description}
        status={statusModal.status}
        onOpenChange={open => setStatusModal(s => ({ ...s, open }))}
      />
    </div>
  );
}
