import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Heart, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  age: string;
  anaemia: string;
  creatinine_phosphokinase: string;
  diabetes: string;
  ejection_fraction: string;
  high_blood_pressure: string;
  platelets: string;
  serum_creatinine: string;
  serum_sodium: string;
  sex: string;
  smoking: string;
  time: string;
}

interface PredictionResult {
  prediction: number;
  probability: number;
  risk_level: string;
}

const HeartFailurePredictionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    anaemia: '',
    creatinine_phosphokinase: '',
    diabetes: '',
    ejection_fraction: '',
    high_blood_pressure: '',
    platelets: '',
    serum_creatinine: '',
    serum_sodium: '',
    sex: '',
    smoking: '',
    time: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    const requiredFields = Object.keys(formData) as (keyof FormData)[];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setError('Please fill in all fields');
      return false;
    }

    // Validate numeric fields
    const numericFields = ['age', 'creatinine_phosphokinase', 'ejection_fraction', 'platelets', 'serum_creatinine', 'serum_sodium', 'time'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof FormData]);
      if (isNaN(value) || value < 0) {
        setError(`${field.replace('_', ' ')} must be a valid positive number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const numericData = {
        age: parseFloat(formData.age),
        anaemia: parseInt(formData.anaemia),
        creatinine_phosphokinase: parseFloat(formData.creatinine_phosphokinase),
        diabetes: parseInt(formData.diabetes),
        ejection_fraction: parseFloat(formData.ejection_fraction),
        high_blood_pressure: parseInt(formData.high_blood_pressure),
        platelets: parseFloat(formData.platelets),
        serum_creatinine: parseFloat(formData.serum_creatinine),
        serum_sodium: parseFloat(formData.serum_sodium),
        sex: parseInt(formData.sex),
        smoking: parseInt(formData.smoking),
        time: parseFloat(formData.time)
      };

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
  console.log('Sending prediction request to', apiBase + '/predict', numericData);

  const response = await fetch(`${apiBase}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Prediction result:', data);

      // Backend returns { prediction: number, probability: number }
      const prediction = typeof data.prediction === 'number' ? data.prediction : parseInt(data.prediction);
      const probability = typeof data.probability === 'number' ? data.probability : parseFloat(data.probability);

      const risk_level = probability >= 0.5 ? 'High Risk' : 'Low Risk';

      const resultData: PredictionResult = {
        prediction: Number(prediction),
        probability: Number(probability),
        risk_level,
      };

      setResult(resultData);

      toast({
        title: "Prediction Complete",
        description: `Risk Level: ${risk_level}`,
      });
    } catch (err) {
      console.error('Prediction error:', err);
  setError('Failed to get prediction. Please ensure the API server is running and accessible.');
      toast({
        title: "Prediction Failed",
        description: "Please check if the API server is running",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBinarySelect = (field: keyof FormData, label: string, trueLabel: string, falseLabel: string) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">{falseLabel}</SelectItem>
          <SelectItem value="1">{trueLabel}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderNumericInput = (field: keyof FormData, label: string, placeholder?: string) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Input
        id={field}
        type="number"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10 lg:space-y-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-pink-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 sm:top-60 right-10 sm:right-20 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-purple-300/30 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 sm:bottom-40 left-1/4 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-pink-200/15 rounded-full blur-2xl animate-pulse delay-500"></div>
      
      {/* Header */}
      <div className="text-center space-y-4 sm:space-y-6 relative max-w-4xl mx-auto">
        <div className="floating-animation relative inline-block">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative">
              <Heart className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 text-primary drop-shadow-lg glow-effect" />
              <Sparkles className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-pink-400 absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text tracking-tight text-center sm:text-left">
              Heart Failure
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">Risk Prediction</h2>
          <div className="w-20 sm:w-24 lg:w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
        </div>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium px-4">
          Enter patient medical parameters to predict heart failure risk using advanced machine learning models
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
        {/* Form Card */}
        <Card className="glass-card glow-effect transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="p-4 sm:p-6 lg:pb-8">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Heart 
                  className="w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 drop-shadow-lg glow-effect" 
                  style={{ color: '#cc0088' }}
                />
                <Sparkles className="w-4 sm:w-4 lg:w-5 h-4 sm:h-4 lg:h-5 text-pink-400 absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 animate-pulse" />
              </div>
              <span className="text-center sm:text-left">Patient Medical Parameters</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-600 text-center sm:text-left">
              Please provide all required medical parameters for accurate AI-powered risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {renderNumericInput('age', 'Age (years)', '40-95')}
              {renderBinarySelect('anaemia', 'Anaemia', 'Yes', 'No')}
              {renderNumericInput('creatinine_phosphokinase', 'Creatinine Phosphokinase (mcg/L)', '23-7861')}
              {renderBinarySelect('diabetes', 'Diabetes', 'Yes', 'No')}
              {renderNumericInput('ejection_fraction', 'Ejection Fraction (%)', '14-80')}
              {renderBinarySelect('high_blood_pressure', 'High Blood Pressure', 'Yes', 'No')}
              {renderNumericInput('platelets', 'Platelets (kiloplatelets/mL)', '25100-850000')}
              {renderNumericInput('serum_creatinine', 'Serum Creatinine (mg/dL)', '0.5-9.4')}
              {renderNumericInput('serum_sodium', 'Serum Sodium (mEq/L)', '113-148')}
              {renderBinarySelect('sex', 'Sex', 'Male', 'Female')}
              {renderBinarySelect('smoking', 'Smoking', 'Yes', 'No')}
              {renderNumericInput('time', 'Follow-up Period (days)', '4-285')}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in border-red-300 bg-red-50/80 backdrop-blur-sm max-w-7xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Predict Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 glow-effect"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
                <span className="hidden sm:inline">Analyzing with AI...</span>
                <span className="sm:hidden">Analyzing...</span>
              </>
            ) : (
              <>
                <Heart className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6" />
                <span className="hidden sm:inline">Predict Risk Now</span>
                <span className="sm:hidden">Predict</span>
                <Sparkles className="ml-2 sm:ml-3 h-5 sm:h-6 w-5 sm:w-6" />
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <Card className="glass-card animate-fade-in glow-effect max-w-7xl mx-auto">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-xl sm:text-2xl lg:text-3xl font-bold">
                {result.risk_level === 'High Risk' ? (
                  <div className="w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                )}
                <span className="gradient-text text-center sm:text-left">AI Prediction Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200/50 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Risk Assessment</h3>
                  <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 ${
                    result.risk_level === 'High Risk' ? 'text-orange-600' : 'text-emerald-600'
                  }`}>
                    {result.risk_level}
                  </p>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
                </div>
                <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200/50 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Confidence Level</h3>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-pink-600 mb-2">
                    {(result.probability * 100).toFixed(1)}%
                  </p>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-pink-100/80 to-purple-100/80 rounded-2xl border-l-4 border-pink-500 backdrop-blur-sm">
                <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                  <strong className="text-pink-700">Medical Disclaimer:</strong> This AI prediction is for informational purposes only and should not replace professional medical advice. 
                  Please consult with a qualified healthcare provider for proper medical assessment and treatment decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default HeartFailurePredictionForm;
