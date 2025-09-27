import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  Plus,
  Trash2,
  Info,
  Package,
  Building2,
  Tag,
  Smartphone,
  Barcode,
  Clock,
  MapPin,
  Image as ImageIcon // Importar o ícone Image
} from 'lucide-react';
import { useNotification } from '@/react-app/components/NotificationSystem';
import { useTheme } from '@/react-app/hooks/useTheme';
import { formatCurrencyInput, parseCurrencyBR, formatCurrencyBR } from '@/react-app/utils/currency';
import CustomerModal from '@/react-app/components/CustomerModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/react-app/hooks/useAuth';

interface PurchaseItem {
  id: string;
  product_id: string; // Changed to product_id
  description: string;
  quantity: number;
  costPrice: number;
  finalPrice: number;
  totalPrice: number;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  condition: string;
  location_id: string; // Changed to location_id
  warranty_term_id: string; // Changed to warranty_term_id
  sku?: string;
  hasImeiSerial: boolean; // Ensure this is always present
}

// Add InventoryUnit interface here for local use in trade-in logic
interface InventoryUnitForTradeIn {
  id: string;
  productSku: string;
  productDescription: string;
  brand: string;
  category: string;
  model?: string;
  color?: string;
  storage?: string;
  condition: 'novo' | 'seminovo' | 'usado';
  location?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  barcode?: string;
  costPrice: number; // This is the cost to the store (what they paid for trade-in)
  salePrice: number; // For inventory, this is the value it's taken in at
  status: 'available' | 'sold' | 'reserved' | 'defective';
  createdAt: string;
  updatedAt: string;
  purchaseId?: string;
  locatorCode?: string;
  warrantyTerm: string; // Added for consistency
}

// New interface for trade-in data returned by PurchaseModal
interface TradeInResult {
  tradeInValue: number;
  newInventoryUnits: InventoryUnitForTradeIn[];
}

// Interface for Customer (to be passed from SalesModal)
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  brand_id: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Variation {
  id: string;
  name: string;
  subcategory_id: string;
}

interface StockLocation {
  id: string;
  name: string;
}

interface WarrantyTerm {
  id: string;
  name: string;
  months: number;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSaved?: (data: any) => void; // Keep as any for flexibility
  onTradeInSaved?: (result: TradeInResult) => void; // New callback for trade-in specific data
  editingPurchase?: any;
  isTradeIn?: boolean;
  tradeInCustomer?: Customer | null; // New prop for trade-in customer
}

export default function PurchaseModal({ 
  isOpen, 
  onClose, 
  onPurchaseSaved, 
  onTradeInSaved, // New prop
  editingPurchase, 
  isTradeIn = false,
  tradeInCustomer = null, // New prop default to null
}: PurchaseModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    supplierId: editingPurchase?.supplier_id || '',
    purchaseDate: editingPurchase?.purchase_date || new Date().toISOString().split('T')[0],
    invoiceNumber: editingPurchase?.invoice_number || '',
    observations: editingPurchase?.observations || ''
  });

  const [selectedSupplier, setSelectedSupplier] = useState(editingPurchase?.supplier_id || '');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Dynamic data from Supabase
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([]);
  const [warrantyTerms, setWarrantyTerms] = useState<WarrantyTerm[]>([]);

  // Product selection states
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedVariationId, setSelectedVariationId] = useState('');
  
  // States for generic product custom description and variations
  const [customProductDescription, setCustomProductDescription] = useState('');
  const [currentVariationInput, setCurrentVariationInput] = useState('');
  const [genericProductVariations, setGenericProductVariations] = useState<string[]>([]);
  
  const [hasImeiSn, setHasImeiSn] = useState<'sim' | 'nao'>('sim');
  
  const [currentItem, setCurrentItem] = useState({
    warranty_term_id: '',
    location_id: '',
    condition: 'novo',
    quantity: 1,
    costPrice: '',
    additionalCost: ''
  });

  const [items, setItems] = useState<PurchaseItem[]>(editingPurchase?.items || []);
  const [additionalCost, setAdditionalCost] = useState(editingPurchase?.additional_cost || 0);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // New state for product type selection
  const [productTypeSelection, setProductTypeSelection] = useState<'apple' | 'generic'>('apple');

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Match animation duration
  };

  // Fetch initial data from Supabase
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchInitialData = async () => {
      // Fetch Suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (suppliersError) console.error('Error fetching suppliers:', suppliersError);
      else setSuppliers(suppliersData || []);

      // Fetch Brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (brandsError) console.error('Error fetching brands:', brandsError);
      else setBrands(brandsData || []);

      // Fetch Categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, brand_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (categoriesError) console.error('Error fetching categories:', categoriesError);
      else setCategories(categoriesData || []);

      // Fetch Subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (subcategoriesError) console.error('Error fetching subcategories:', subcategoriesError);
      else setSubcategories(subcategoriesData || []);

      // Fetch Variations
      const { data: variationsData, error: variationsError } = await supabase
        .from('variations')
        .select('id, name, subcategory_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (variationsError) console.error('Error fetching variations:', variationsError);
      else setVariations(variationsData || []);

      // Fetch Stock Locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('stock_locations')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (locationsError) console.error('Error fetching stock locations:', locationsError);
      else setStockLocations(locationsData || []);

      // Fetch Warranty Terms
      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranty_terms')
        .select('id, name, months')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (warrantyError) console.error('Error fetching warranty terms:', warrantyError);
      else setWarrantyTerms(warrantyData || []);
    };

    fetchInitialData();
  }, [isOpen, user]);

  // Effect to initialize form data when modal opens or editingPurchase/tradeInCustomer changes
  useEffect(() => {
    if (isOpen) {
      // Determine default brand ID for Apple
      const appleBrandId = brands.find(b => b.name === 'Apple')?.id || '';

      if (isTradeIn && tradeInCustomer) {
        setFormData(prev => ({
          ...prev,
          supplierId: tradeInCustomer.id,
          purchaseDate: new Date().toISOString().split('T')[0],
          invoiceNumber: '',
          observations: `Aparelho recebido em troca do cliente: ${tradeInCustomer.name}`
        }));
        setSelectedSupplier(tradeInCustomer.id);
        setSupplierSearchTerm(tradeInCustomer.name);
        setProductTypeSelection('apple'); // Default to Apple for trade-in
        setSelectedBrandId(appleBrandId); 
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
        setSelectedVariationId('');
        setCustomProductDescription('');
        setGenericProductVariations([]);
        setItems([]);
        setAdditionalCost(0);
      } else if (editingPurchase) {
        setFormData({
          supplierId: editingPurchase.supplier_id || '',
          purchaseDate: editingPurchase.purchase_date || new Date().toISOString().split('T')[0],
          invoiceNumber: editingPurchase.invoice_number || '',
          observations: editingPurchase.observations || ''
        });
        setSelectedSupplier(editingPurchase.supplier_id || '');
        const foundSupplierName = suppliers.find(s => s.id === editingPurchase.supplier_id)?.name;
        setSupplierSearchTerm(foundSupplierName || editingPurchase.supplier_name || '');
        setItems(editingPurchase.items || []);
        setAdditionalCost(editingPurchase.additional_cost || 0);
        // Re-populate product selection fields if editing an existing item
        if (editingPurchase.items && editingPurchase.items.length > 0) {
          const firstItem = editingPurchase.items[0]; // Assuming all items in a purchase share product structure
          setSelectedBrandId(firstItem.brand_id || '');
          setSelectedCategoryId(firstItem.category_id || '');
          setSelectedSubcategoryId(firstItem.subcategory_id || '');
          setSelectedVariationId(firstItem.variation_id || '');
          // Determine if it's an Apple product based on the first item's brand
          if (firstItem.brand_id === appleBrandId) {
            setProductTypeSelection('apple');
          } else {
            setProductTypeSelection('generic');
            // Note: Custom description and generic variations are not automatically re-populated
            // from a single description string when editing a generic product.
            // User would need to re-enter if modifying.
            setCustomProductDescription(''); 
            setGenericProductVariations([]);
          }
        }
      } else {
        // Reset form for new purchase
        setFormData({
          supplierId: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          invoiceNumber: '',
          observations: ''
        });
        setSelectedSupplier('');
        setSupplierSearchTerm('');
        setProductTypeSelection('apple'); // Default to Apple for new purchase
        setSelectedBrandId(appleBrandId); 
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
        setSelectedVariationId('');
        setCustomProductDescription('');
        setGenericProductVariations([]);
        setItems([]);
        setAdditionalCost(0);
      }
      // Set default location and warranty if available
      if (stockLocations.length > 0 && !currentItem.location_id) {
        setCurrentItem(prev => ({ ...prev, location_id: stockLocations[0].id }));
      }
      if (warrantyTerms.length > 0 && !currentItem.warranty_term_id) {
        setCurrentItem(prev => ({ ...prev, warranty_term_id: warrantyTerms[0].id }));
      }
    }
  }, [isOpen, editingPurchase, isTradeIn, tradeInCustomer, suppliers, stockLocations, warrantyTerms, brands]); // Added brands to dependency array

  // Effect to handle product type selection changes
  useEffect(() => {
    const appleBrandId = brands.find(b => b.name === 'Apple')?.id || '';
    if (productTypeSelection === 'apple') {
      setSelectedBrandId(appleBrandId);
    } else {
      setSelectedBrandId(''); // Clear brand for generic selection
    }
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setSelectedVariationId('');
    setCustomProductDescription(''); // Clear custom description
    setGenericProductVariations([]); // Clear generic variations
    setCurrentVariationInput(''); // Clear current variation input
  }, [productTypeSelection, brands]);

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );
  
  const appleBrandId = brands.find(b => b.name === 'Apple')?.id;
  const appleCategories = categories.filter(cat => cat.brand_id === appleBrandId);

  const availableCategories = productTypeSelection === 'apple' 
    ? appleCategories 
    : categories.filter(cat => cat.brand_id === selectedBrandId);

  const availableSubcategories = subcategories.filter(subcat => subcat.category_id === selectedCategoryId);
  const availableVariations = variations.filter(v => v.subcategory_id === selectedSubcategoryId);

  const addGenericVariation = () => {
    if (currentVariationInput.trim()) {
      setGenericProductVariations([...genericProductVariations, currentVariationInput.trim()]);
      setCurrentVariationInput('');
    }
  };

  const resetCurrentItem = () => {
    setCurrentItem({
      ...currentItem,
      quantity: 1,
      costPrice: '',
      additionalCost: ''
    });
    // Reset product selection fields based on current productTypeSelection
    if (productTypeSelection === 'apple') {
      const appleBrandId = brands.find(b => b.name === 'Apple')?.id || '';
      setSelectedBrandId(appleBrandId);
    } else {
      setSelectedBrandId('');
    }
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setSelectedVariationId('');
    setCustomProductDescription(''); // Reset custom description
    setGenericProductVariations([]); // Reset generic variations
    setCurrentVariationInput(''); // Reset current variation input
  };

  const getProductDescription = () => {
    let description = '';
    const brandName = brands.find(b => b.id === selectedBrandId)?.name;
    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name;
    const subcategoryName = subcategories.find(s => s.id === selectedSubcategoryId)?.name;
    const variationName = variations.find(v => v.id === selectedVariationId)?.name;

    // Prioritize custom description for generic products if provided
    if (productTypeSelection === 'generic' && customProductDescription) {
      description = customProductDescription;
      if (genericProductVariations.length > 0) {
        description += ` - ${genericProductVariations.join(', ')}`;
      }
    } else { // Structured flow (Apple or Generic using structured fields)
      if (brandName) description += brandName;
      if (categoryName) description += ` ${categoryName}`;
      if (subcategoryName) description += ` ${subcategoryName}`;
      if (variationName) description += ` ${variationName}`;
    }
    
    return description.trim();
  };

  const getProductSku = () => {
    let sku = '';
    const brandName = brands.find(b => b.id === selectedBrandId)?.name;
    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name;
    const subcategoryName = subcategories.find(s => s.id === selectedSubcategoryId)?.name;
    const variationName = variations.find(v => v.id === selectedVariationId)?.name;

    // Prioritize custom description for generic products if provided
    if (productTypeSelection === 'generic' && customProductDescription) {
      sku = customProductDescription
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map((word: string) => word.substring(0, 2))
        .join('')
        .toUpperCase()
        .substring(0, 6);
      if (genericProductVariations.length > 0) {
        sku += genericProductVariations.map(v => v.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3)).join('').toUpperCase();
      }
    } else { // Structured flow
      if (brandName) sku += brandName.substring(0, 3).toUpperCase();
      if (categoryName) sku += categoryName.substring(0, 3).toUpperCase();
      if (subcategoryName) sku += subcategoryName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
      if (variationName) sku += variationName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    }
    return sku.trim();
  };

  const addItem = async () => {
    const description = getProductDescription();
    const sku = getProductSku();
    
    if (!description || !currentItem.costPrice || !selectedSupplier || !currentItem.location_id || !currentItem.warranty_term_id) {
      showError('Campos obrigatórios', 'Preencha todos os campos obrigatórios: fornecedor, marca, categoria, descrição do produto, preço de custo, localização e garantia.');
      return;
    }

    const costPrice = parseCurrencyBR(currentItem.costPrice);
    const itemSpecificAdditionalCost = parseCurrencyBR(currentItem.additionalCost);
    const quantity = currentItem.quantity;

    if (costPrice <= 0) {
      showError('Valores inválidos', 'Preço de custo deve ser maior que zero');
      return;
    }

    const finalPrice = costPrice + itemSpecificAdditionalCost;
    const totalPrice = finalPrice * quantity;

    const hasImeiSerial = hasImeiSn === 'sim';

    // Find or create product in `products` table
    let productId = '';
    const { data: existingProducts, error: productSearchError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', user?.id)
      .eq('sku', sku)
      .eq('description', description)
      .single();

    if (productSearchError && productSearchError.code !== 'PGRST116') { // PGRST116 means no rows found
      showError('Erro ao buscar produto', productSearchError.message);
      console.error('Error searching product:', productSearchError);
      return;
    }

    if (existingProducts) {
      productId = existingProducts.id;
    } else {
      const { data: newProduct, error: productInsertError } = await supabase
        .from('products')
        .insert({
          user_id: user?.id,
          sku: sku,
          description: description,
          brand_id: selectedBrandId || null,
          category_id: selectedCategoryId || null,
          subcategory_id: selectedSubcategoryId || null,
          variation_id: selectedVariationId || null,
          cost_price: costPrice,
          sale_price: finalPrice, // Default sale price to finalPrice
          min_stock: 0, // Default min_stock
          location_id: currentItem.location_id, // Default location
          requires_imei: hasImeiSerial,
          requires_serial: hasImeiSerial,
          warranty_term_id: currentItem.warranty_term_id,
          is_active: true,
        })
        .select('id')
        .single();

      if (productInsertError) {
        showError('Erro ao criar produto', productInsertError.message);
        console.error('Error creating product:', productInsertError);
        return;
      }
      productId = newProduct.id;
    }

    const newItem: PurchaseItem = {
      id: Date.now().toString(), // Temporary client-side ID
      product_id: productId,
      description,
      quantity,
      costPrice,
      finalPrice,
      totalPrice,
      condition: currentItem.condition,
      location_id: currentItem.location_id,
      warranty_term_id: currentItem.warranty_term_id,
      hasImeiSerial
    };

    setItems([...items, newItem]);
    showSuccess('Item adicionado', `${description} adicionado à compra.`);
    resetCurrentItem();
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const additionalCostTotal = parseCurrencyBR(formatCurrencyInput(additionalCost.toString()));
  const total = subtotal + additionalCostTotal;

  const generateLocatorCode = (): string => {
    const prefix = 'LOC';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      showError('Nenhum item', 'Adicione pelo menos um item');
      return;
    }

    if (!selectedSupplier) {
      showError('Fornecedor obrigatório', 'Selecione um fornecedor');
      return;
    }

    if (!user) {
      showError('Erro', 'Usuário não autenticado.');
      return;
    }

    const supplierName = suppliers.find(s => s.id === selectedSupplier)?.name || 'Fornecedor Desconhecido';
    const locatorCode = editingPurchase?.locator_code || generateLocatorCode();
    
    if (isTradeIn) {
      const newInventoryUnits: InventoryUnitForTradeIn[] = [];
      let totalTradeInValue = 0;

      for (const item of items) {
          const newUnitId = `tradein-unit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          const newInventoryUnit: InventoryUnitForTradeIn = {
              id: newUnitId,
              productSku: item.sku || getProductSku(), // Use item's SKU or generate
              productDescription: item.description,
              brand: brands.find(b => b.id === selectedBrandId)?.name || 'N/A', 
              category: categories.find(c => c.id === selectedCategoryId)?.name || 'N/A', 
              condition: item.condition as any,
              location: stockLocations.find(loc => loc.id === item.location_id)?.name || 'N/A',
              costPrice: item.costPrice, 
              salePrice: item.costPrice, // Value it's taken in at
              status: 'available',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              imei1: item.imei1,
              imei2: item.imei2,
              serialNumber: item.serialNumber,
              barcode: undefined, // Barcode not typically used for trade-in
              warrantyTerm: warrantyTerms.find(w => w.id === item.warranty_term_id)?.name || 'Sem garantia'
          };
          newInventoryUnits.push(newInventoryUnit);
          totalTradeInValue += item.costPrice * item.quantity; 
      }

      if (onTradeInSaved) {
          onTradeInSaved({
              tradeInValue: totalTradeInValue,
              newInventoryUnits: newInventoryUnits
          });
      }
      showSuccess('Trade-in registrado', `Valor de R$ ${formatCurrencyBR(totalTradeInValue)} adicionado como pagamento.`);
      handleClose();
      return; 
    }

    // Determine purchase status
    const requiresFinalization = items.some(item => item.hasImeiSerial);
    const purchaseStatus = requiresFinalization ? 'pending' : 'completed';

    const purchaseData = {
      user_id: user.id,
      locator_code: locatorCode,
      supplier_id: selectedSupplier,
      purchase_date: formData.purchaseDate,
      invoice_number: formData.invoiceNumber || null,
      observations: formData.observations || null,
      subtotal: subtotal,
      additional_cost: additionalCostTotal,
      total: total,
      status: purchaseStatus,
    };

    let purchaseId = editingPurchase?.id;
    let savedPurchase;

    if (editingPurchase) {
      // Update existing purchase
      const { data, error } = await supabase
        .from('purchases')
        .update(purchaseData)
        .eq('id', editingPurchase.id)
        .select()
        .single();

      if (error) {
        showError('Erro ao atualizar compra', error.message);
        console.error('Error updating purchase:', error);
        return;
      }
      savedPurchase = data;
      purchaseId = data.id;

      // Delete existing purchase items and re-insert
      const { error: deleteItemsError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', purchaseId);
      if (deleteItemsError) {
        showError('Erro ao limpar itens da compra', deleteItemsError.message);
        console.error('Error deleting old purchase items:', deleteItemsError);
        return;
      }
    } else {
      // Insert new purchase
      const { data, error } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

      if (error) {
        showError('Erro ao criar compra', error.message);
        console.error('Error creating purchase:', error);
        return;
      }
      savedPurchase = data;
      purchaseId = data.id;
    }

    // Insert purchase items
    const purchaseItemsToInsert = items.map(item => ({
      user_id: user.id,
      purchase_id: purchaseId,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      cost_price: item.costPrice,
      final_price: item.finalPrice,
      total_price: item.totalPrice,
      condition_id: item.condition, // Assuming condition is an ID
      location_id: item.location_id,
      warranty_term_id: item.warranty_term_id,
      has_imei_serial: item.hasImeiSerial,
    }));

    const { error: insertItemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItemsToInsert);

    if (insertItemsError) {
      showError('Erro ao inserir itens da compra', insertItemsError.message);
      console.error('Error inserting purchase items:', insertItemsError);
      return;
    }

    // If purchase does not require finalization, create inventory units directly
    if (!requiresFinalization) {
      const inventoryUnitsToInsert = items.flatMap(item => {
        const units = [];
        for (let i = 0; i < item.quantity; i++) {
          units.push({
            user_id: user.id,
            product_id: item.product_id,
            condition_id: item.condition,
            location_id: item.location_id,
            warranty_term_id: item.warranty_term_id,
            cost_price: item.costPrice,
            sale_price: item.finalPrice,
            status: 'available',
            purchase_id: purchaseId,
          });
        }
        return units;
      });

      const { error: insertUnitsError } = await supabase
        .from('inventory_units')
        .insert(inventoryUnitsToInsert);

      if (insertUnitsError) {
        showError('Erro ao criar unidades de estoque', insertUnitsError.message);
        console.error('Error inserting inventory units:', insertUnitsError);
        return;
      }
    }

    if (onPurchaseSaved) {
      onPurchaseSaved({ ...savedPurchase, items: purchaseItemsToInsert });
    }
    
    showSuccess(
      `${editingPurchase ? 'Compra atualizada' : 'Compra registrada'} com sucesso!`,
      `Localizador: ${locatorCode} - ${items.length} itens ${editingPurchase ? 'atualizados' : 'registrados'}`
    );
    handleClose();
  };

  if (!isOpen && !isAnimatingOut) return null;

  const isSupplierInputDisabled = isTradeIn && tradeInCustomer !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } ${isAnimatingOut ? 'animate-modal-out' : 'animate-modal-in'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-bold flex items-center">
            <Package className="mr-2" size={20} />
            {isTradeIn ? 'Trade-in: Entrada no Estoque' : editingPurchase ? 'Editar Compra' : 'Lançamento de Compras'}
          </h2>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`p-4 ${theme === 'dark' ? 'text-white' : ''}`}>
          {/* Supplier Selection and Registration Note */}
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* Supplier Search */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Fornecedor *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar fornecedor..."
                      value={supplierSearchTerm}
                      onChange={(e) => {
                        setSupplierSearchTerm(e.target.value);
                        setShowSupplierDropdown(true);
                        if (!e.target.value) {
                          setSelectedSupplier('');
                        }
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      disabled={isSupplierInputDisabled}
                      className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-900'
                      } ${isSupplierInputDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {showSupplierDropdown && supplierSearchTerm && filteredSuppliers.length > 0 && !isSupplierInputDisabled && (
                      <div className={`absolute z-10 w-full mt-1 border rounded shadow-lg max-h-32 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-slate-300'
                      } animate-dropdown-in`}>
                        {filteredSuppliers.map(supplier => (
                          <button
                            key={supplier.id}
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(supplier.id);
                              setSupplierSearchTerm(supplier.name);
                              setShowSupplierDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 transition-colors text-xs ${
                              theme === 'dark' 
                                ? 'hover:bg-slate-600 text-white' 
                                : 'hover:bg-blue-50 text-slate-900'
                            }`}
                          >
                            {supplier.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(true)}
                    disabled={isSupplierInputDisabled}
                    className={`px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center ${isSupplierInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Adicionar novo fornecedor"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Registration Note */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Cadastros
                </label>
                <div className={`rounded p-2 ${
                  theme === 'dark' 
                    ? 'bg-blue-900/50 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <Info className={`mr-1 mt-0.5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} size={12} />
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      Para cadastrar Marcas, Categorias e Grades,{' '}
                      <a 
                        href="/administration/product-structure" 
                        target="_blank"
                        className={`underline font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'hover:text-blue-200' 
                            : 'hover:text-blue-900'
                        }`}
                      >
                        clique aqui
                      </a>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Row - Garantia, Local e Condição */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Garantia *
              </label>
              <select
                value={currentItem.warranty_term_id}
                onChange={(e) => setCurrentItem({...currentItem, warranty_term_id: e.target.value})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Selecione</option>
                {warrantyTerms.map(term => (
                  <option key={term.id} value={term.id}>{term.name} ({term.months} meses)</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Local estoque *
              </label>
              <select
                value={currentItem.location_id}
                onChange={(e) => setCurrentItem({...currentItem, location_id: e.target.value})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Selecione</option>
                {stockLocations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Condição
              </label>
              <select
                value={currentItem.condition}
                onChange={(e) => setCurrentItem({...currentItem, condition: e.target.value as 'novo' | 'seminovo' | 'usado'})}
                className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="novo">Novo</option>
                <option value="seminovo">Seminovo</option>
                <option value="usado">Usado</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                IMEI/SN?
              </label>
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasImeiSn"
                    value="sim"
                    checked={hasImeiSn === 'sim'}
                    onChange={(e) => setHasImeiSn(e.target.value as 'sim' | 'nao')}
                    className="mr-1"
                  />
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>Sim</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasImeiSn"
                    value="nao"
                    checked={hasImeiSn === 'nao'}
                    onChange={(e) => setHasImeiSn(e.target.value as 'sim' | 'nao')}
                    className="mr-1"
                  />
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>Não</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Type Selection */}
          <div className={`mb-4 p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setProductTypeSelection('apple')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  productTypeSelection === 'apple'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-600'
                      : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Produto Apple
              </button>
              <button
                type="button"
                onClick={() => setProductTypeSelection('generic')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  productTypeSelection === 'generic'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-600'
                      : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Produto Genérico
              </button>
            </div>
          </div>

          {/* Product Form (always structured, but with conditional generic fields) */}
          <div className="space-y-3 mb-4">
            <div className="space-y-3">
              {/* Linha única compacta - Marca, Categoria, Subcategoria, Variação */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Marca*
                  </label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      setSelectedCategoryId('');
                      setSelectedSubcategoryId('');
                      setSelectedVariationId('');
                    }}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    disabled={productTypeSelection === 'apple'}
                  >
                    <option value="">Marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Categoria*
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setSelectedSubcategoryId('');
                      setSelectedVariationId('');
                    }}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    disabled={!selectedBrandId}
                  >
                    <option value="">Categoria</option>
                    {availableCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Subcategoria*
                  </label>
                  <select
                    value={selectedSubcategoryId}
                    onChange={(e) => {
                      setSelectedSubcategoryId(e.target.value);
                      setSelectedVariationId('');
                    }}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    disabled={!selectedCategoryId}
                  >
                    <option value="">Subcategoria</option>
                    {availableSubcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Variação
                  </label>
                  <select
                    value={selectedVariationId}
                    onChange={(e) => setSelectedVariationId(e.target.value)}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    disabled={!selectedSubcategoryId || availableVariations.length === 0}
                  >
                    <option value="">Variação</option>
                    {availableVariations.map(variation => (
                      <option key={variation.id} value={variation.id}>{variation.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generic Product Custom Description and Variations (conditional) */}
              {productTypeSelection === 'generic' && (
                <>
                  <div className="mb-2">
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Descrição Customizada (Opcional)
                    </label>
                    <input
                      type="text"
                      value={customProductDescription}
                      onChange={(e) => setCustomProductDescription(e.target.value)}
                      className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="Ex: Capinha de Silicone"
                    />
                  </div>

                  <div className="mb-2">
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Variações Genéricas (Opcional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentVariationInput}
                        onChange={(e) => setCurrentVariationInput(e.target.value)}
                        className={`flex-1 px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          theme === 'dark'
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="Ex: 128GB, Azul"
                      />
                      <button
                        type="button"
                        onClick={addGenericVariation}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    {genericProductVariations.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {genericProductVariations.map((variation, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs flex items-center gap-1"
                          >
                            {variation}
                            <button
                              type="button"
                              onClick={() => setGenericProductVariations(genericProductVariations.filter((_, i) => i !== index))}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={8} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Linha de Quantidade, Preço de Custo e Custo Adicional - compacta */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    className={`w-full px-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Preço de Custo *
                  </label>
                  <div className="relative">
                    <span className={`absolute left-1.5 top-1/2 transform -translate-y-1/2 text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>R$</span>
                    <input
                      type="text"
                      value={currentItem.costPrice}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        setCurrentItem({...currentItem, costPrice: formattedValue});
                      }}
                      className={`w-full pl-6 pr-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Custo Adicional
                  </label>
                  <div className="relative">
                    <span className={`absolute left-1.5 top-1/2 transform -translate-y-1/2 text-xs ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>R$</span>
                    <input
                      type="text"
                      value={currentItem.additionalCost}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        setCurrentItem({...currentItem, additionalCost: formattedValue});
                      }}
                      className={`w-full pl-6 pr-1.5 py-1 text-xs border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Adicionar Item compacto */}
              <button
                type="button"
                onClick={addItem}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-1.5 rounded hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium text-xs"
              >
                ADICIONAR ITEM
              </button>
            </div>
          </div>

          {/* Items Table - compacta */}
          <div className="mb-4">
            <div className={`rounded p-3 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold text-sm flex items-center ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  <Package className="mr-2" size={16} />
                  Produtos
                </h3>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>Total: {items.length}</span>
              </div>

              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`text-left text-xs font-medium border-b ${
                        theme === 'dark' 
                          ? 'text-slate-300 border-slate-600' 
                          : 'text-slate-700 border-slate-200'
                      }`}>
                        <th className="pb-1">#</th>
                        <th className="pb-1">Descrição</th>
                        <th className="pb-1">Qtd</th>
                        <th className="pb-1">Preço (un)</th>
                        <th className="pb-1">Total</th>
                        <th className="pb-1 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className={`border-b ${
                          theme === 'dark' ? 'border-slate-600' : 'border-slate-100'
                        }`}>
                          <td className="py-1.5 text-xs">{index + 1}</td>
                          <td className="py-1.5">
                            <div>
                              <div className={`font-medium text-xs ${
                                theme === 'dark' ? 'text-white' : 'text-slate-800'
                              }`}>{item.description}</div>
                              <div className={`text-xs ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {item.condition} • {warrantyTerms.find(w => w.id === item.warranty_term_id)?.name || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 text-xs">{item.quantity}</td>
                          <td className="py-1.5 text-xs">R$ {formatCurrencyBR(item.costPrice)}</td>
                          <td className="py-1.5 text-xs font-medium">R$ {formatCurrencyBR(item.totalPrice)}</td>
                          <td className="py-1.5 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Remover item"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-6 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum item adicionado</p>
                </div>
              )}
            </div>
          </div>

          {/* Totals compactos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Subtotal
              </label>
              <div className={`px-3 py-1.5 rounded font-medium text-sm ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                R$ {formatCurrencyBR(subtotal)}
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Custo Adicional
              </label>
              <div className="relative">
                <span className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-xs ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>R$</span>
                <input
                  type="text"
                  value={formatCurrencyInput(additionalCost.toString())}
                  onChange={(e) => {
                    const formattedValue = formatCurrencyInput(e.target.value);
                    setAdditionalCost(parseCurrencyBR(formattedValue));
                  }}
                  className={`w-full pl-6 pr-3 py-1.5 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Total
              </label>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded font-bold text-sm">
                R$ {formatCurrencyBR(total)}
              </div>
            </div>
          </div>

          {/* Action Buttons compactos */}
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 border rounded hover:bg-slate-50 transition-colors text-sm ${
                theme === 'dark'
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded hover:shadow-lg transition-all duration-200 flex items-center text-sm"
            >
              <Save className="mr-2" size={14} />
              {editingPurchase ? 'Atualizar' : isTradeIn ? 'Confirmar Trade-in' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Modal */}
      <CustomerModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        type="supplier"
        onCustomerSaved={(newSupplier) => {
          setSuppliers(prev => [...prev, newSupplier]);
          setSelectedSupplier(newSupplier.id);
          setSupplierSearchTerm(newSupplier.name);
        }}
      />
    </div>
  );
}