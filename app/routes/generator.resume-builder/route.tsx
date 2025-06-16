import { useState } from "react";
import type { Route } from "./+types/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { 
  FileText, 
  Sparkles, 
  Download,
  Eye,
  Briefcase,
  User,
  Linkedin,
  Building2,
  Palette,
  FileUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Target,
  Wand2,
  Copy,
  Share2,
  FileDown,
  Maximize2
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Header } from "~/components/layout/header";
import { generateResume, type ResumeConfig, type GeneratedContent } from "./ai-prompts";
import { ResumeTemplate } from "./templates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Resume Builder - Create Professional Resumes Instantly" },
    { name: "description", content: "Build tailored resumes with AI assistance. Upload your current resume, add LinkedIn profile, and customize for specific positions." },
  ];
}


const themes = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary',
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    icon: Zap
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and professional',
    preview: 'bg-gradient-to-br from-gray-50 to-slate-100',
    icon: Briefcase
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and unique',
    preview: 'bg-gradient-to-br from-purple-50 to-pink-100',
    icon: Palette
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    preview: 'bg-gradient-to-br from-white to-gray-50',
    icon: Target
  }
];

export default function ResumeBuilder() {
  const [config, setConfig] = useState<ResumeConfig>({
    includeCoverLetter: false,
    currentResume: '',
    linkedinProfile: '',
    companyInfo: '',
    positionInfo: '',
    theme: 'modern',
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const updateConfig = (key: keyof ResumeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        updateConfig('currentResume', text);
        toast({
          title: "Resume uploaded",
          description: "Your current resume has been loaded successfully.",
        });
      };
      reader.readAsText(file);
    }
  };

  const generateResumeContent = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await generateResume(config);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setGeneratedContent(result);
      toast({
        title: "Resume generated!",
        description: "Your professional resume is ready to download.",
      });
    } catch (error) {
      console.error('Failed to generate resume:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadResume = async (format: 'pdf' | 'txt') => {
    if (!generatedContent) return;
    
    setIsExporting(true);
    
    try {
      if (format === 'pdf') {
        // Generate PDF using html2canvas + jsPDF for styled templates
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;
        
        const resumeElement = document.getElementById('resume-preview');
        if (resumeElement) {
          const canvas = await html2canvas(resumeElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210;
          const pageHeight = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          pdf.save(`resume-${generatedContent.resume.header.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
        }
        
        toast({
          title: "PDF Downloaded!",
          description: "Your styled resume has been saved as a PDF file.",
        });
      } else {
        // Download as formatted text
        const resume = generatedContent.resume;
        const textContent = `${resume.header.name}\n${resume.header.title}\n\n` +
          `Email: ${resume.header.email}\n` +
          `Phone: ${resume.header.phone}\n` +
          (resume.header.location ? `Location: ${resume.header.location}\n` : '') +
          (resume.header.linkedin ? `LinkedIn: ${resume.header.linkedin}\n` : '') +
          (resume.header.github ? `GitHub: ${resume.header.github}\n` : '') +
          `\n\nPROFESSIONAL SUMMARY\n${resume.summary}\n\n` +
          `EXPERIENCE\n` +
          resume.experience.map(exp => 
            `${exp.title} | ${exp.company} | ${exp.startDate} - ${exp.endDate}\n` +
            exp.achievements.map(achievement => `• ${achievement}`).join('\n') + '\n'
          ).join('\n') +
          `\nEDUCATION\n` +
          resume.education.map(edu => 
            `${edu.degree} | ${edu.school} | ${edu.graduationDate}\n`
          ).join('') +
          `\nSKILLS\n` +
          (resume.skills.languages ? `Languages: ${resume.skills.languages.join(', ')}\n` : '') +
          (resume.skills.frameworks ? `Frameworks: ${resume.skills.frameworks.join(', ')}\n` : '') +
          (resume.skills.tools ? `Tools: ${resume.skills.tools.join(', ')}\n` : '');
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${resume.header.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Text Downloaded!",
          description: "Your resume has been saved as a text file.",
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const shareResume = async () => {
    if (!generatedContent) return;
    
    const resume = generatedContent.resume;
    const textContent = `${resume.header.name} - ${resume.header.title}\n\n` +
      `${resume.summary}\n\n` +
      `Contact: ${resume.header.email} | ${resume.header.phone}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resume.header.name} - Resume`,
          text: textContent,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(textContent);
      toast({
        title: "Copied!",
        description: "Resume summary copied to clipboard",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
        <div className="max-w-7xl mx-auto space-y-6 mt-6">
          {/* Header */}
          <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Resume Builder
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Create tailored, professional resumes with AI assistance
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1 bg-blue-100 dark:bg-blue-900/30 border-blue-300">
                    <Wand2 className="h-3 w-3" />
                    AI-Powered
                  </Badge>
                  <Badge variant="outline" className="gap-1 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300">
                    <Target className="h-3 w-3" />
                    ATS-Optimized
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {!generatedContent ? (
            // Configuration Phase - Full width before generation
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Resume Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your resume for the perfect match
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Resume Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload" className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      Current Resume (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="resume-upload"
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileUpload}
                        className="flex-1"
                      />
                      {config.currentResume && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* LinkedIn Profile */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile URL
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={config.linkedinProfile}
                      onChange={(e) => updateConfig('linkedinProfile', e.target.value)}
                    />
                  </div>

                  <Separator />

                  {/* Company & Position Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Target Company
                      </Label>
                      <Textarea
                        id="company"
                        placeholder="Company name and what they do..."
                        value={config.companyInfo}
                        onChange={(e) => updateConfig('companyInfo', e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Position
                      </Label>
                      <Textarea
                        id="position"
                        placeholder="Job title and key requirements..."
                        value={config.positionInfo}
                        onChange={(e) => updateConfig('positionInfo', e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Cover Letter Option */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="cover-letter" className="text-base cursor-pointer">
                        Include Cover Letter
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Generate a tailored cover letter alongside your resume
                      </p>
                    </div>
                    <Switch
                      id="cover-letter"
                      checked={config.includeCoverLetter}
                      onCheckedChange={(checked) => updateConfig('includeCoverLetter', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card className="shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <Sparkles className="h-16 w-16 mx-auto" />
                      <h3 className="text-2xl font-semibold">Ready to Generate?</h3>
                      <p className="text-blue-100">
                        AI will create a tailored resume based on your inputs
                      </p>
                    </div>
                    
                    {isGenerating && (
                      <Progress value={progress} className="h-3" />
                    )}
                    
                    <Button
                      onClick={generateResumeContent}
                      disabled={isGenerating}
                      className="w-full bg-white text-blue-600 hover:bg-blue-50"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-6 w-6" />
                          Generate Resume
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Include specific company details for better tailoring
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Add your LinkedIn for comprehensive experience data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Generate first, then choose your theme and export
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      Always customize for each application
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Preview Phase - Front and center after generation
            <div className="space-y-8">
              {/* Success Banner */}
              <Card className="shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Resume Generated Successfully!</h3>
                      <p className="text-green-100">Choose your style and export when ready</p>
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="ghost"
                        onClick={() => setGeneratedContent(null)}
                        className="text-white hover:bg-white/20"
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Theme Selection - Prominent */}
                <Card className="shadow-xl border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Palette className="h-6 w-6" />
                      Choose Your Style
                    </CardTitle>
                    <CardDescription>
                      Select a theme to see your resume styled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={config.theme}
                      onValueChange={(value) => updateConfig('theme', value as ResumeConfig['theme'])}
                      className="space-y-4"
                    >
                      {themes.map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <label
                            key={theme.id}
                            htmlFor={theme.id}
                            className={cn(
                              "relative flex cursor-pointer items-center space-x-4 rounded-lg border-2 p-4 hover:bg-accent transition-all",
                              config.theme === theme.id ? "border-primary bg-primary/5 shadow-md" : "border-muted"
                            )}
                          >
                            <RadioGroupItem value={theme.id} id={theme.id} />
                            <div className={cn(
                              "h-12 w-12 rounded-md flex-shrink-0",
                              theme.preview
                            )} />
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="font-semibold">{theme.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{theme.description}</p>
                            </div>
                            {config.theme === theme.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Live Preview - Center Stage */}
                <Card className="lg:col-span-2 shadow-xl border-2 border-indigo-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Eye className="h-6 w-6" />
                          Live Preview
                        </CardTitle>
                        <CardDescription>
                          See how your resume looks with the selected theme
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const preview = document.getElementById('resume-preview');
                            if (preview) {
                              preview.requestFullscreen();
                            }
                          }}
                        >
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Fullscreen
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      id="resume-preview"
                      className="border-2 rounded-lg bg-white max-h-[700px] overflow-y-auto shadow-inner"
                    >
                      <ResumeTemplate resume={generatedContent.resume} theme={config.theme} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options - Prominent Bottom Section */}
              <Card className="shadow-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Download className="h-6 w-6" />
                    Export Your Resume
                  </CardTitle>
                  <CardDescription>
                    Download or share your professionally crafted resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={() => downloadResume('pdf')}
                      disabled={isExporting}
                      className="gap-2 h-12"
                      size="lg"
                    >
                      {isExporting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileDown className="h-5 w-5" />
                      )}
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadResume('txt')}
                      disabled={isExporting}
                      className="gap-2 h-12"
                      size="lg"
                    >
                      <FileDown className="h-5 w-5" />
                      Download TXT
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 h-12"
                      onClick={shareResume}
                      size="lg"
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 h-12"
                      onClick={() => {
                        const resume = generatedContent.resume;
                        const textContent = `${resume.header.name}\n${resume.header.title}\n\nEmail: ${resume.header.email}\nPhone: ${resume.header.phone}\n\n${resume.summary}`;
                        navigator.clipboard.writeText(textContent);
                        toast({
                          title: "Copied!",
                          description: "Resume summary copied to clipboard",
                        });
                      }}
                      size="lg"
                    >
                      <Copy className="h-5 w-5" />
                      Copy
                    </Button>
                  </div>
                  
                  {config.includeCoverLetter && generatedContent.coverLetter && (
                    <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Cover Letter Included</span>
                        <Badge variant="secondary">Ready to export</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>


      <Toaster />
    </>
  );
}