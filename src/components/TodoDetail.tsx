import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PencilIcon, TrashIcon, XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Item {
  _id: string;
  key?: string;
  value?: string;
  name?: string;
  notes?: string;
  points?: number;
  links?: string[];
  images?: string[];
  createdAt: string;
  targetDate?: string;
  status?: 'ETS' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Todo {
  _id: string;
  title: string;
  items: Item[];
  user: string;
  createdAt: string;
  targetDate?: string;
}

interface TodoDetailProps {
  todo: Todo;
  onUpdateTodo: (todo: Todo) => void;
}

export default function TodoDetail({ todo, onUpdateTodo }: TodoDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      const updatedTodo = {
        ...todo,
        items: todo.items.filter((item) => item._id !== itemToDelete._id),
      };
      onUpdateTodo(updatedTodo);
      setItemToDelete(null);
      setIsDeleteConfirmOpen(false);
      toast.success('Item deleted successfully');
    }
  };

  const cancelDeleteItem = () => {
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleSubmitItem = (formData: Item) => {
    console.log('handleSubmitItem called with:', JSON.stringify(formData, null, 2));

    let updatedItems;
    if (isEditing && currentItem) {
      updatedItems = todo.items.map((item) =>
        item._id === currentItem._id ? { ...item, ...formData } : item
      );
    } else {
      // Let MongoDB generate the ID
      const newItem = {
        ...formData,
      };
      updatedItems = [...todo.items, newItem];
    }

    console.log('Updated items array:', JSON.stringify(updatedItems, null, 2));

    onUpdateTodo({
      ...todo,
      items: updatedItems,
    });
    setIsModalOpen(false);
  };



  // Filter items based on search query
  const filteredItems = todo.items.filter(item =>
  (item.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.value?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div
        className="flex justify-between items-center mb-6 bg-slate-900 rounded-lg shadow-md p-4 border border-gray-300"
        data-aos="fade-down"
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">{todo.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
            {todo.targetDate && (
              <span className={`${new Date(todo.targetDate) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                Target: {new Date(todo.targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-xl rounded-md hover:from-blue-800 hover:to-indigo-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          Add Item
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-gray-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items by key or value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-gray-300 rounded-md text-slate-200 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-slate-900"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-slate-700">
            {filteredItems.map((item, index) => {
              return (
                <tr
                  key={item._id}
                  className="hover:bg-slate-900 transition-all duration-300"
            
                >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="block"
                      title={item.key || ''}
                    >
                      {item.key ? (
                        <>
                          {/* Desktop: show up to 30 chars */}
                          <span className="hidden md:inline">
                            {item.key.length > 30 
                              ? `${item.key.substring(0, 30)}...` 
                              : item.key}
                          </span>
                          {/* Mobile: show up to 10 chars */}
                          <span className="md:hidden">
                            {item.key.length > 10 
                              ? `${item.key.substring(0, 10)}...` 
                              : item.key}
                          </span>
                        </>
                      ) : '-'}
                    </span>
                    {item.key && (
                      <button
                        onClick={() => copyToClipboard(item.key!)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors duration-300 flex-shrink-0"
                        title="Copy full key"
                      >
                        <ClipboardIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="block"
                      title={item.value || ''}
                    >
                      {item.value ? (
                        <>
                          {/* Desktop: show up to 30 chars */}
                          <span className="hidden md:inline">
                            {item.value.length > 30 
                              ? `${item.value.substring(0, 30)}...` 
                              : item.value}
                          </span>
                          {/* Mobile: show up to 10 chars */}
                          <span className="md:hidden">
                            {item.value.length > 10 
                              ? `${item.value.substring(0, 10)}...` 
                              : item.value}
                          </span>
                        </>
                      ) : '-'}
                    </span>
                    {item.value && (
                      <button
                        onClick={() => copyToClipboard(item.value!)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors duration-300 flex-shrink-0"
                        title="Copy full value"
                      >
                        <ClipboardIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-white  mr-4 p-1.5 rounded-full hover:bg-slate-600 transition-all duration-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-slate-900 transition-all duration-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                  <div
                    className="flex flex-col items-center justify-center"
                    data-aos="fade-up"
                  >
                    <img
                      src="/file.svg"
                      alt="No items"
                      className="h-16 w-16 mb-4 opacity-60 invert"
                    />
                    <p>{searchQuery ? 'No items found matching your search.' : 'No items in this Project yet. Add one to get started.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black backdrop-blur-sm" aria-hidden="true" />

          <div
            className="relative bg-black00 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-gray-300"
            data-aos="zoom-in"
          >
            <h3 className="text-lg font-medium mb-4 text-center bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              {isEditing ? 'Edit Item' : 'Add Item'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: Item = {
                  _id: currentItem?._id || `temp_${Math.random().toString(36).substr(2, 9)}`,
                  key: formData.get('key') as string,
                  value: formData.get('value') as string,
                  createdAt: currentItem?.createdAt || new Date().toISOString(),
                };

                handleSubmitItem(data);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Key *
                </label>
                <input
                  type="text"
                  name="key"
                  defaultValue={currentItem?.key || ''}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Value *
                </label>
                <input
                  type="text"
                  name="value"
                  defaultValue={currentItem?.value || ''}
                  required
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-300 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-yellow-400 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-md hover:from-blue-800 hover:to-indigo-900 transition-all duration-300 shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={cancelDeleteItem}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black backdrop-blur-sm" aria-hidden="true" />

          <div
            className="relative bg-slate-900 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-gray-300"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium mb-2 text-center text-white">
              Delete Item
            </h3>
            
            <p className="text-sm text-slate-400 text-center mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            
            {itemToDelete && (
              <div className="bg-slate-800 rounded-lg p-3 mb-6 border border-slate-700">
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="text-yellow-400 font-medium">Key:</span>
                    <span className="text-slate-300 ml-2">{itemToDelete.key || '-'}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400 font-medium">Value:</span>
                    <span className="text-slate-300 ml-2">{itemToDelete.value || '-'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelDeleteItem}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-300 border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
