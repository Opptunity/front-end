'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Eye,
  ArrowLeft,
  Loader2,
  Users,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface Engineer {
  id: number;
  name: string;
  email: string;
  equipe_id?: number;
}

export default function EngineersListPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await fetch('/api/engineers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch engineers');
        }
        
        const data = await response.json();
        setEngineers(data.engineers || []);
        setFilteredEngineers(data.engineers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch engineers');
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEngineers(engineers);
    } else {
      const filtered = engineers.filter(engineer =>
        engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        engineer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEngineers(filtered);
    }
  }, [searchTerm, engineers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-lg text-gray-600">Loading engineers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <p className="text-lg text-red-600 mb-4">{error}</p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              Engineers Directory
            </h1>
            <p className="text-gray-600 mt-1">{filteredEngineers.length} engineers found</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search engineers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Engineers Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredEngineers.map((engineer, index) => (
            <motion.div
              key={engineer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{engineer.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    {engineer.email}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {engineer.equipe_id && (
                      <Badge variant="outline" className="text-xs">
                        Team {engineer.equipe_id}
                      </Badge>
                    )}
                  </div>
                  
                  <Link href={`/engineer-profile/${engineer.id}`} className="block">
                    <Button className="w-full" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEngineers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No engineers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms.' : 'No engineers have been added yet.'}
            </p>
            <Link href="/cv-assessment">
              <Button>
                Add New Engineer
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
} 