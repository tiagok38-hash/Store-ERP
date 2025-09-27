import { supabase } from './client';

const PRODUCT_IMAGES_BUCKET = 'product-images';

export const uploadProductImage = async (file: File, productId: string, userId: string): Promise<string | null> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${productId}/${Date.now()}.${fileExtension}`; // Path: userId/productId/timestamp.ext

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading product image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Construct the public URL
  const { data: publicUrlData } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  // Extract the path from the public URL
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.indexOf(PRODUCT_IMAGES_BUCKET);
  if (bucketIndex === -1) {
    console.warn('Image URL does not contain the product images bucket name:', imageUrl);
    return;
  }
  const path = urlParts.slice(bucketIndex + 1).join('/');

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting product image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

export const getPublicProductImageUrl = (path: string): string => {
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};