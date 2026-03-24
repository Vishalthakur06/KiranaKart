import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProducts = createAsyncThunk("products/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/products", { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
  }
});

export const fetchProductById = createAsyncThunk("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Product not found");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: { products: [], selectedProduct: null, loading: false, error: null, total: 0, page: 1, pages: 1 },
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.products) {
          state.products = action.payload.products;
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.pages = action.payload.pages || 1;
        } else {
          state.products = action.payload;
          state.total = action.payload?.length || 0;
          state.page = 1;
          state.pages = 1;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.selectedProduct = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
