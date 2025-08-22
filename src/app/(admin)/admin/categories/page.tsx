'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus, Tag, Award, Image as ImageIcon, Layers } from 'lucide-react';
import { Category } from '@/types/category';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/hooks/use-toast';
import { useCategories } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useApi';
import { frontendServices } from '@/lib/services/frontendServices';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { StatusModal } from '@/components/admin/status-modal';
import Image from 'next/image';

type ErrorWithMessage = { message: string };
type ErrorWithError = { error: string };
type ErrorWithDetails = { details: string };
type PossibleError = string | ErrorWithMessage | ErrorWithError | ErrorWithDetails | undefined | null;

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
  function getErrorMessage(err: PossibleError): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err === 'object') {
      if ('error' in err && typeof err.error === 'string') {
        return err.error;
      }
      if ('message' in err && typeof err.message === 'string') {
        return err.message;
      }
    }
    return 'An error occurred';
  }
  function getErrorDetails(err: PossibleError): string | undefined {
    if (err && typeof err === 'object' && 'details' in err && typeof err.details === 'string') {
      return err.details;
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
    } catch (error: unknown) {
      setStatusModal({
        open: true,
        title: 'Error',
        description: getErrorMessage(error as PossibleError) || 'Failed to delete category',
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
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error as PossibleError) || 'Failed to save category', variant: 'destructive' });
      throw error;
    }
  };

  // Stats for the dashboard
  const categories = (Array.isArray(data?.data) ? data.data : []) as unknown as Category[];
  const stats = {
    total: categories.length,
    featured: categories.filter(cat => cat.featured).length,
    withImages: categories.filter(cat => cat.image).length,
    types: [...new Set(categories.map(cat => cat.type))].length,
  };

  // Don't render until client-side hydration and auth is complete
  if (!isInitialized) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Categories Management
            </h1>
            <p className="text-muted-foreground">Manage your car categories and types</p>
          </div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Categories Management
            </h1>
            <p className="text-muted-foreground">Manage your car categories and types</p>
          </div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Categories Management
            </h1>
            <p className="text-muted-foreground">Manage your car categories and types</p>
          </div>
        </div>
        
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Categories Management
          </h1>
          <p className="text-muted-foreground">Manage your car categories and types</p>
        </div>
        <Button 
          onClick={() => { setSelectedCategory(undefined); setDialogOpen(true); }}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Images</p>
                <p className="text-2xl font-bold text-green-400">{stats.withImages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Types</p>
                <p className="text-2xl font-bold text-orange-400">{stats.types}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {error ? (
            <div className="flex items-center gap-2 text-destructive mb-6">
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
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Image</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Slug</TableHead>
                    <TableHead className="text-muted-foreground">Featured</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="border-border/50 hover:bg-accent/50 transition-colors">
                      <TableCell>
                        {category.image && category.image.trim() !== '' ? (
                          <div className="relative w-12 h-12">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.type}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          category.featured 
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {category.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDialogOpen(true);
                            }}
                            className="border-border/50 hover:bg-accent/50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedCategory(category); setDeleteDialogOpen(true); }}
                            className="border-border/50 hover:bg-destructive hover:text-destructive-foreground"
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

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No categories found</h3>
              <p className="text-sm text-muted-foreground/70 mb-4">Get started by adding your first category.</p>
              <Button 
                onClick={() => { setSelectedCategory(undefined); setDialogOpen(true); }}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-border/50">
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
