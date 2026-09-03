import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, X, Sparkles, CheckCircle, DollarSign, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { makePayment } from '../utils/walletManager';
import { formatCurrency } from '../mockData';
import { toast } from 'sonner@2.0.3';

interface SmartSplitProps {
  onClose: () => void;
}

interface Person {
  id: string;
  name: string;
  paidAmount: number;
  owedAmount: number;
}

interface SplitItem {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
}

export function SmartSplit({ onClose }: SmartSplitProps) {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'You', paidAmount: 0, owedAmount: 0 }
  ]);
  const [items, setItems] = useState<SplitItem[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItem, setNewItem] = useState({
    description: '',
    amount: '',
    paidBy: 'You'
  });
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const addPerson = () => {
    if (!newPersonName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName,
      paidAmount: 0,
      owedAmount: 0
    };

    setPeople([...people, newPerson]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    if (id === '1') {
      toast.error('Cannot remove yourself');
      return;
    }
    setPeople(people.filter(p => p.id !== id));
  };

  const addItem = () => {
    if (!newItem.description || !newItem.amount) {
      toast.error('Please fill item details');
      return;
    }

    const item: SplitItem = {
      id: Date.now().toString(),
      description: newItem.description,
      amount: parseFloat(newItem.amount),
      paidBy: newItem.paidBy
    };

    setItems([...items, item]);
    setNewItem({ description: '', amount: '', paidBy: 'You' });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateSplit = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const perPerson = totalAmount / people.length;

    const updatedPeople = people.map(person => {
      const paid = items
        .filter(item => item.paidBy === person.name)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        ...person,
        paidAmount: paid,
        owedAmount: paid - perPerson
      };
    });

    setPeople(updatedPeople);
    setShowAISuggestion(true);
  };

  const handleSettlement = async () => {
    // Log payment for settlement
    const youPerson = people.find(p => p.name === 'You');
    if (youPerson && youPerson.owedAmount < 0) {
      // You owe money
      await makePayment(
        'SmartSplit Settlement',
        Math.abs(youPerson.owedAmount),
        'Bills & Utilities',
        undefined,
        undefined,
        'wallet'
      );
      toast.success('Settlement Completed!', {
        description: `You paid ${formatCurrency(Math.abs(youPerson.owedAmount))}`
      });
    } else if (youPerson && youPerson.owedAmount > 0) {
      toast.success('Settlement Recorded!', {
        description: `You will receive ${formatCurrency(youPerson.owedAmount)}`
      });
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const isCalculated = people.some(p => p.paidAmount > 0 || p.owedAmount !== 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto my-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  SmartSplit AI
                </CardTitle>
                <CardDescription>Split bills fairly with AI-powered suggestions</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* People */}
            <div>
              <h3 className="font-semibold mb-3">People in Group</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {people.map((person) => (
                  <Card key={person.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {person.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{person.name}</span>
                      </div>
                      {person.id !== '1' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removePerson(person.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add person name..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                />
                <Button onClick={addPerson}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3">Expenses</h3>
              
              {items.length > 0 && (
                <div className="space-y-2 mb-3">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Paid by {item.paidBy}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-lg">{formatCurrency(item.amount)}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4 text-money-out" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <Label htmlFor="item-desc">Description</Label>
                      <Input
                        id="item-desc"
                        placeholder="e.g., Dinner"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-amount">Amount (₹)</Label>
                      <Input
                        id="item-amount"
                        type="number"
                        placeholder="0.00"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-paidby">Paid By</Label>
                      <select
                        id="item-paidby"
                        value={newItem.paidBy}
                        onChange={(e) => setNewItem({ ...newItem, paidBy: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {people.map((person) => (
                          <option key={person.id} value={person.name}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={addItem} className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Total */}
            {items.length > 0 && (
              <Card className="card-stat">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{ color: 'var(--ink)' }} />
                      <span className="font-semibold">Total Amount</span>
                    </div>
                    <span className="text-2xl font-display" style={{ color: 'var(--ink)' }}>{formatCurrency(totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calculate Button */}
            {items.length > 0 && !isCalculated && (
              <Button onClick={calculateSplit} className="w-full" size="lg">
                <Sparkles className="w-5 h-5" />
                Calculate Fair Split with AI
              </Button>
            )}

            {/* AI Suggestions */}
            {showAISuggestion && isCalculated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="border fin-pop-in" style={{ background: 'color-mix(in oklab, var(--money-in) 6%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 30%, transparent)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-money-in" />
                      <h4 className="font-semibold">
                        AI Fair Split Calculation
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on who paid what, here's the fair settlement:
                    </p>

                    <div className="space-y-3">
                      {people.map((person) => (
                        <div key={person.id} className="list-row bg-card rounded-lg px-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {person.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{person.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Paid: {formatCurrency(person.paidAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {person.owedAmount > 0 ? (
                              <div>
                                <Badge className="bg-money-in text-white border-0 mb-1">Gets Back</Badge>
                                <p className="font-semibold font-display text-money-in">
                                  {formatCurrency(Math.abs(person.owedAmount))}
                                </p>
                              </div>
                            ) : person.owedAmount < 0 ? (
                              <div>
                                <Badge variant="destructive" className="mb-1">Owes</Badge>
                                <p className="font-semibold font-display text-money-out">
                                  {formatCurrency(Math.abs(person.owedAmount))}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Badge variant="outline" className="mb-1">Settled</Badge>
                                <p className="text-sm text-muted-foreground">₹0</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                      <p className="text-sm font-medium mb-2">
                        💡 AI Suggestion:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {people.find(p => p.name === 'You')?.owedAmount! < 0
                          ? `You should pay ${formatCurrency(Math.abs(people.find(p => p.name === 'You')?.owedAmount || 0))} to settle your share.`
                          : people.find(p => p.name === 'You')?.owedAmount! > 0
                          ? `You should receive ${formatCurrency(Math.abs(people.find(p => p.name === 'You')?.owedAmount || 0))} from the group.`
                          : 'You\'re all settled up! No payments needed.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPeople(people.map(p => ({ ...p, paidAmount: 0, owedAmount: 0 })));
                      setShowAISuggestion(false);
                    }}
                    className="flex-1"
                  >
                    Recalculate
                  </Button>
                  <Button
                    onClick={handleSettlement}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Settled
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Add expenses to start splitting bills</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
