import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const saveCartToBackend = createAsyncThunk("cart/save", async (items, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/cart", { items });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to save cart");
  }
});

export const placeOrder = createAsyncThunk("cart/placeOrder", async ({ items, totalPrice }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/orders", { items, totalPrice });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to place order");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], orderSuccess: false, loading: false, error: null },
  reducers: {
    addItem(state, action) {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ product, qty });
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
    },
    updateQty(state, action) {
      const { productId, qty } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) item.qty = qty;
    },
    clearCart(state) {
      state.items = [];
      state.orderSuccess = false;
    },
    clearOrderSuccess(state) {
      state.orderSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.orderSuccess = true;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addItem, removeItem, updateQty, clearCart, clearOrderSuccess } = cartSlice.actions;
export default cartSlice.reducer;
