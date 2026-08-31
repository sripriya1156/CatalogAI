import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Premium Watch', price: 199.99, description: 'Elegant and durable.' },
    { id: '2', name: 'Wireless Headphones', price: 89.99, description: 'Noise cancelling, rich bass.' },
  ]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      description: desc,
    };
    setProducts([...products, newProduct]);
    setName('');
    setPrice('');
    setDesc('');
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Products Inventory
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-purple-300">{p.name}</h3>
                  <p className="text-2xl font-semibold mb-2 text-pink-400">${p.price.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm mb-4">{p.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition text-sm font-semibold"
                >
                  Delete Product
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl h-fit">
          <h2 className="text-2xl font-bold mb-6 text-pink-300">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                placeholder="Product title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                placeholder="9.99"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                placeholder="Product description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Upload Product Image (Cloudinary)</label>
              <input
                type="file"
                className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                disabled
              />
              <p className="text-[10px] text-gray-500 mt-1">Image upload connects to Cloudinary via backend.</p>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition text-sm"
            >
              Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
