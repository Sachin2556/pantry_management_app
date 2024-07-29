import { useState, useEffect } from 'react';
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function PantryManager() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0 });

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'pantryItems'));
      const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
    };

    fetchItems();
  }, []);

  const addItem = async () => {
    if (newItem.name.trim() === '') return;

    const docRef = await addDoc(collection(db, 'pantryItems'), newItem);
    setItems([...items, { id: docRef.id, ...newItem }]);
    setNewItem({ name: '', quantity: 0 });
  };

  const updateItemQuantity = async (id, quantity) => {
    const itemDoc = doc(db, 'pantryItems', id);
    await updateDoc(itemDoc, { quantity });

    setItems(items.map(item => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = async id => {
    const itemDoc = doc(db, 'pantryItems', id);
    await deleteDoc(itemDoc);

    setItems(items.filter(item => item.id !== id));
  };

  return (
    <Container>
      <h1>Pantry Management</h1>
      <TextField
        label="Item Name"
        value={newItem.name}
        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
      />
      <TextField
        label="Quantity"
        type="number"
        value={newItem.quantity}
        onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
      />
      <Button variant="contained" color="primary" startIcon={<Add />} onClick={addItem}>
        Add Item
      </Button>
      <List>
        {items.map(item => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.name}
              secondary={`Quantity: ${item.quantity}`}
            />
            <TextField
              label="Update Quantity"
              type="number"
              value={item.quantity}
              onChange={e => updateItemQuantity(item.id, Number(e.target.value))}
            />
            <IconButton edge="end" color="secondary" onClick={() => removeItem(item.id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
