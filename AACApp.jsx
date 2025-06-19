import React, { useState, useRef } from 'react';
import { Volume2, Home, Settings, Plus, Edit3, Trash2, Save, X, Upload } from 'lucide-react';

const AACApp = () => {
  const [currentCategory, setCurrentCategory] = useState('home');
  const [spokenText, setSpokenText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemForm, setNewItemForm] = useState({ text: '', image: '', category: '' });
  const [newCategoryForm, setNewCategoryForm] = useState({ title: '', image: '', color: 'blue' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const fileInputRef = useRef(null);
  const categoryFileInputRef = useRef(null);

  const [categories, setCategories] = useState({
    home: {
      title: 'AAC Device',
      color: 'blue',
      items: [
        { text: 'Foods', image: '🍎', category: 'foods', id: 'cat-foods' },
        { text: 'Drinks', image: '🥤', category: 'drinks', id: 'cat-drinks' },
        { text: 'Activities', image: '⚽', category: 'activities', id: 'cat-activities' },
        { text: 'People', image: '👨‍👩‍👧‍👦', category: 'people', id: 'cat-people' }
      ]
    },
    foods: {
      title: 'Foods',
      color: 'green',
      items: [
        { text: 'Apple', image: '🍎', id: 'food-1' },
        { text: 'Pizza', image: '🍕', id: 'food-2' },
        { text: 'Sandwich', image: '🥪', id: 'food-3' },
        { text: 'Ice Cream', image: '🍦', id: 'food-4' }
      ]
    },
    drinks: {
      title: 'Drinks',
      color: 'cyan',
      items: [
        { text: 'Water', image: '💧', id: 'drink-1' },
        { text: 'Milk', image: '🥛', id: 'drink-2' },
        { text: 'Juice', image: '🧃', id: 'drink-3' },
        { text: 'Coffee', image: '☕', id: 'drink-4' }
      ]
    },
    activities: {
      title: 'Activities',
      color: 'purple',
      items: [
        { text: 'Play', image: '🎮', id: 'activity-1' },
        { text: 'Read', image: '📚', id: 'activity-2' },
        { text: 'Watch TV', image: '📺', id: 'activity-3' },
        { text: 'Music', image: '🎵', id: 'activity-4' }
      ]
    },
    people: {
      title: 'People',
      color: 'pink',
      items: [
        { text: 'Mom', image: '👩', id: 'person-1' },
        { text: 'Dad', image: '👨', id: 'person-2' },
        { text: 'Sister', image: '👧', id: 'person-3' },
        { text: 'Brother', image: '👦', id: 'person-4' }
      ]
    }
  });

  const commonPhrases = [
    { text: 'I want', image: '👆', id: 'phrase-1' },
    { text: 'Please', image: '🙏', id: 'phrase-2' },
    { text: 'Thank you', image: '😊', id: 'phrase-3' },
    { text: 'Yes', image: '✅', id: 'phrase-4' },
    { text: 'No', image: '❌', id: 'phrase-5' },
    { text: 'Help', image: '🆘', id: 'phrase-6' }
  ];

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const handleFileUpload = (file, isCategory = false) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isCategory) {
          setNewCategoryForm(prev => ({ ...prev, image: e.target.result }));
        } else {
          setNewItemForm(prev => ({ ...prev, image: e.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemClick = (item) => {
    if (editMode && !item.category) {
      setEditingItem(item);
      setNewItemForm({ text: item.text, image: item.image, category: currentCategory });
      return;
    }

    if (item.category) {
      setCurrentCategory(item.category);
    } else {
      const newText = spokenText ? `${spokenText} ${item.text}` : item.text;
      setSpokenText(newText);
      speak(item.text);
    }
  };

  const addOrUpdateItem = () => {
    if (!newItemForm.text || !newItemForm.image) return;

    const itemData = {
      text: newItemForm.text,
      image: newItemForm.image,
      id: editingItem ? editingItem.id : `custom-${Date.now()}`
    };

    setCategories(prev => ({
      ...prev,
      [currentCategory]: {
        ...prev[currentCategory],
        items: editingItem 
          ? prev[currentCategory].items.map(item => 
              item.id === editingItem.id ? itemData : item
            )
          : [...prev[currentCategory].items, itemData]
      }
    }));

    setNewItemForm({ text: '', image: '', category: '' });
    setEditingItem(null);
  };

  const addNewCategory = () => {
    if (!newCategoryForm.title || !newCategoryForm.image) return;

    const categoryKey = newCategoryForm.title.toLowerCase().replace(/\s+/g, '');
    
    setCategories(prev => ({
      ...prev,
      [categoryKey]: {
        title: newCategoryForm.title,
        color: newCategoryForm.color,
        items: []
      },
      home: {
        ...prev.home,
        items: [...prev.home.items, {
          text: newCategoryForm.title,
          image: newCategoryForm.image,
          category: categoryKey,
          id: `cat-${categoryKey}`
        }]
      }
    }));

    setNewCategoryForm({ title: '', image: '', color: 'blue' });
    setShowAddCategory(false);
  };

  const deleteItem = (item) => {
    setCategories(prev => ({
      ...prev,
      [currentCategory]: {
        ...prev[currentCategory],
        items: prev[currentCategory].items.filter(i => i.id !== item.id)
      }
    }));
  };

  const deleteCategory = (categoryKey) => {
    if (categoryKey === 'home') return;
    
    setCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[categoryKey];
      newCategories.home = {
        ...newCategories.home,
        items: newCategories.home.items.filter(item => item.category !== categoryKey)
      };
      return newCategories;
    });

    if (currentCategory === categoryKey) {
      setCurrentCategory('home');
    }
  };

  const getThemeColors = (category) => {
    const color = categories[category]?.color || 'blue';
    const colorMap = {
      blue: 'bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-800',
      green: 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800',
      purple: 'bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-800',
      pink: 'bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-800',
      cyan: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-200 text-cyan-800',
      orange: 'bg-orange-100 hover:bg-orange-200 border-orange-200 text-orange-800',
      yellow: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200 text-yellow-800',
      red: 'bg-red-100 hover:bg-red-200 border-red-200 text-red-800'
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderImage = (imageData) => {
    if (imageData.startsWith('data:image/')) {
      return <img src={imageData} alt="" className="w-12 h-12 object-cover rounded" />;
    }
    return <div className="text-4xl">{imageData}</div>;
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Categories</h3>
              <div className="space-y-2">
                {Object.entries(categories).filter(([key]) => key !== 'home').map(([key, category]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {renderImage(categories.home.items.find(item => item.category === key)?.image || '📁')}
                      <span className="font-medium">{category.title}</span>
                      <span className="text-sm text-gray-500">({category.items.length} items)</span>
                    </div>
                    <button
                      onClick={() => deleteCategory(key)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  setCategories({
                    home: {
                      title: 'AAC Device',
                      color: 'blue',
                      items: [
                        { text: 'Foods', image: '🍎', category: 'foods', id: 'cat-foods' },
                        { text: 'Drinks', image: '🥤', category: 'drinks', id: 'cat-drinks' }
                      ]
                    },
                    foods: { title: 'Foods', color: 'green', items: [] },
                    drinks: { title: 'Drinks', color: 'cyan', items: [] }
                  });
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {categories[currentCategory]?.title || 'AAC Device'}
          </h1>
          <div className="flex gap-2">
            {currentCategory !== 'home' && (
              <>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`${editMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'} text-white p-3 rounded-lg`}
                >
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => setCurrentCategory('home')}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg"
                >
                  <Home size={20} />
                </button>
              </>
            )}
            {currentCategory === 'home' && (
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg"
              >
                <Plus size={20} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Speech Output */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-16 flex items-center justify-between">
          <p className="font-medium text-gray-800 text-lg">
            {spokenText || 'Tap words to build a sentence...'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => speak(spokenText)}
              disabled={!spokenText}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white p-3 rounded-lg"
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={() => setSpokenText('')}
              disabled={!spokenText}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-3 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryForm.title}
              onChange={(e) => setNewCategoryForm(prev => ({ ...prev, title: e.target.value }))}
              className="border border-gray-300 rounded-lg p-2"
            />
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], true)}
                ref={categoryFileInputRef}
                className="hidden"
              />
              <button
                onClick={() => categoryFileInputRef.current?.click()}
                className="border border-gray-300 rounded-lg p-2 flex items-center gap-2 flex-1"
              >
                <Upload size={16} />
                Upload Image
              </button>
              <input
                type="text"
                placeholder="or emoji"
                value={newCategoryForm.image}
                onChange={(e) => setNewCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                className="border border-gray-300 rounded-lg p-2 w-20"
              />
            </div>
            <select
              value={newCategoryForm.color}
              onChange={(e) => setNewCategoryForm(prev => ({ ...prev, color: e.target.value }))}
              className="border border-gray-300 rounded-lg p-2"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="cyan">Cyan</option>
              <option value="orange">Orange</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addNewCategory}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Create Category
            </button>
            <button
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryForm({ title: '', image: '', color: 'blue' });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Item Form */}
      {editMode && currentCategory !== 'home' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Word/Phrase"
              value={newItemForm.text}
              onChange={(e) => setNewItemForm(prev => ({ ...prev, text: e.target.value }))}
              className="border border-gray-300 rounded-lg p-2"
            />
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-300 rounded-lg p-2 flex items-center gap-2 flex-1"
              >
                <Upload size={16} />
                Upload Image
              </button>
              <input
                type="text"
                placeholder="or emoji"
                value={newItemForm.image}
                onChange={(e) => setNewItemForm(prev => ({ ...prev, image: e.target.value }))}
                className="border border-gray-300 rounded-lg p-2 w-20"
              />
            </div>
            <button
              onClick={addOrUpdateItem}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {editingItem ? 'Update' : 'Add'}
            </button>
          </div>
          {editingItem && (
            <button
              onClick={() => {
                setEditingItem(null);
                setNewItemForm({ text: '', image: '', category: '' });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Quick Phrases */}
      {currentCategory !== 'home' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Phrases</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {commonPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleItemClick(phrase)}
                className="bg-yellow-200 hover:bg-yellow-300 p-3 rounded-lg text-center border-2 border-yellow-300"
              >
                <div className="mb-2">{renderImage(phrase.image)}</div>
                <div className="font-medium text-gray-800 text-sm">{phrase.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories[currentCategory]?.items.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full ${getThemeColors(currentCategory)} p-6 rounded-lg text-center border-2 min-h-32`}
              >
                <div className="mb-2 flex justify-center">{renderImage(item.image)}</div>
                <div className="font-semibold text-lg">{item.text}</div>
              </button>
              {editMode && (
                <button
                  onClick={() => currentCategory === 'home' ? deleteCategory(item.category) : deleteItem(item)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AACApp;
