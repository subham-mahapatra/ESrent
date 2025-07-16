'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
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
import { Brand } from '@/types/brand';

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>(undefined);
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchBrands = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/brands?page=${page}&limit=${limit}`);
      const data = await res.json();
      setBrands(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(page);
  }, [page]);

  const handleSaveBrand = async (brandData: Partial<Brand>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    try {
      let res;
      if (brandData.id) {
        // Update
        res = await fetch(`/api/brands/${brandData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(brandData),
        });
      } else {
        // Create
        res = await fetch('/api/brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(brandData),
        });
      }
      if (!res.ok) throw new Error('Failed to save brand');
      setStatusModal({
        open: true,
        title: brandData.id ? 'Brand Updated' : 'Brand Created',
        description: `The brand has been ${brandData.id ? 'updated' : 'created'} successfully.`,
        status: 'success',
      });
      fetchBrands(page);
    } catch (err) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: 'Failed to save brand.',
        status: 'error',
      });
    } finally {
      setDialogOpen(false);
      setSelectedBrand(undefined);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    try {
      const res = await fetch(`/api/brands/${selectedBrand.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to delete brand');
      setStatusModal({
        open: true,
        title: 'Brand Deleted',
        description: 'The brand has been deleted successfully.',
        status: 'success',
      });
      fetchBrands(page);
    } catch (err) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: 'Failed to delete brand.',
        status: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBrand(undefined);
    }
  };

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
                          unoptimized
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
          {/* Pagination Controls */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="self-center">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
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
