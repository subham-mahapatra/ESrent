'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus } from 'lucide-react';
import { Category } from '@/types/category';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/hooks/use-toast';
import { useCategories } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useApi';
import { PaginatedResponse } from '@/lib/services/frontendServices';
import { frontendServices } from '@/lib/services/frontendServices';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { StatusModal } from '@/components/admin/status-modal';

export default function AdminCategories() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { data, loading, error, refetch } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
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
  const { toast } = useToast();

  // Helper to extract error message
  function getErrorMessage(err: unknown): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && 'error' in err && typeof (err as any).error === 'string') {
      return (err as any).error;
    }
    return 'An error occurred';
  }
  function getErrorDetails(err: unknown): string | undefined {
    if (err && typeof err === 'object' && 'details' in err && typeof (err as any).details === 'string') {
      return (err as any).details;
    }
    return undefined;
  }

  // Delete category handler
  const handleDeleteCategory = async (category: Category) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: 'Not authenticated',
        status: 'error',
      });
      return;
    }
    try {
      await frontendServices.deleteCategory(category.id!, token);
      setStatusModal({
        open: true,
        title: 'Category Deleted',
        description: `${category.name} has been deleted successfully.`,
        status: 'success',
      });
      refetch();
    } catch (error: any) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: error?.message || 'Failed to delete category',
        status: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCategory(undefined);
    }
  };

  // Save (add or update) category handler
  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }
    try {
      if (selectedCategory && selectedCategory.id) {
        // Update
        await frontendServices.updateCategory(selectedCategory.id, categoryData, token);
        toast({ title: 'Category updated', description: `${categoryData.name} has been updated successfully.` });
      } else {
        // Create
        await frontendServices.createCategory(categoryData, token);
        toast({ title: 'Category added', description: `${categoryData.name} has been added successfully.` });
      }
      setDialogOpen(false);
      setSelectedCategory(undefined);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save category', variant: 'destructive' });
      throw error;
    }
  };

  // Don't render until client-side hydration and auth is complete
  if (!isInitialized) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <p className="text-destructive font-semibold">You must be logged in as admin to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <div className="flex justify-between items-center p-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Manage your categories here.
            </p>
          </div>
          <Button onClick={() => { setSelectedCategory(undefined); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertCircle className="h-4 w-4" />
              <p>{getErrorMessage(error)}</p>
              {getErrorDetails(error) && (
                <p className="text-sm text-muted-foreground">{getErrorDetails(error)}</p>
              )}
            </div>
          ) : null}

          <div className="relative">
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}> 
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data && 'categories' in data && Array.isArray(data.categories) ? data.categories : []).map((category: Category) => (
                    <TableRow key={category.id} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        {category.image ? (
                          <div className="relative w-12 h-12">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.type}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.featured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedCategory(category); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={async () => { await handleDeleteCategory(selectedCategory!); }}>
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
