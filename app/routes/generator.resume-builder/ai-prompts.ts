// Resume Builder specific AI prompts and logic

import { aiService } from "~/lib/ai";

export type ResumeConfig = {
  includeCoverLetter: boolean;
  currentResume: string;
  linkedinProfile: string;
  companyInfo: string;
  positionInfo: string;
  theme: 'modern' | 'classic' | 'creative' | 'minimal';
  format: 'pdf' | 'docx' | 'txt';
};

export type StructuredResume = {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
    honors?: string;
  }>;
  skills: {
    technical?: string[];
    languages?: string[];
    frameworks?: string[];
    tools?: string[];
    soft?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expirationDate?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
};

export type GeneratedContent = {
  resume: StructuredResume;
  coverLetter?: string;
};

const fallbackResume: StructuredResume = {
  header: {
    name: "John Doe",
    title: "Senior Software Engineer",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe"
  },
  summary: "Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading teams and delivering high-quality solutions. Passionate about clean code and modern development practices.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "2020",
      endDate: "Present",
      achievements: [
        "Led development of microservices architecture serving 1M+ users",
        "Mentored team of 5 junior developers, improving code quality by 40%",
        "Implemented CI/CD pipeline reducing deployment time by 60%",
        "Architected scalable APIs handling 10K+ requests per minute"
      ]
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA", 
      startDate: "2018",
      endDate: "2020",
      achievements: [
        "Built RESTful APIs and React applications for e-commerce platform",
        "Optimized database queries improving performance by 50%",
        "Collaborated with product team to deliver features on schedule",
        "Reduced application load time by 35% through code optimization"
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Technology",
      location: "San Francisco, CA",
      graduationDate: "2018",
      gpa: "3.8/4.0"
    }
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Java"],
    frameworks: ["React", "Node.js", "Express", "Django", "Next.js"],
    tools: ["Git", "Docker", "AWS", "Jenkins", "PostgreSQL", "MongoDB"],
    soft: ["Leadership", "Mentoring", "Problem Solving", "Communication"]
  },
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2021"
    }
  ]
};

const fallbackCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. With my extensive experience in software development and proven track record of delivering high-quality solutions, I am confident I would be a valuable addition to your team.

In my current role as Senior Software Engineer at TechCorp Inc., I have led the development of microservices architecture serving over 1 million users. I have also mentored a team of junior developers and implemented efficient CI/CD pipelines that significantly improved our deployment process.

I am particularly drawn to your company's innovative approach and commitment to excellence. The opportunity to contribute to your mission while continuing to grow professionally is extremely appealing to me.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
John Doe`;

export async function generateResume(config: ResumeConfig): Promise<GeneratedContent> {
  try {
    const prompt = `You are a professional resume writer and career coach. Create a tailored resume based on the following information:

Current Resume/Experience: ${config.currentResume || 'No current resume provided - create realistic professional experience'}
LinkedIn Profile: ${config.linkedinProfile || 'Not provided'}
Target Company: ${config.companyInfo || 'General application'}
Target Position: ${config.positionInfo || 'Software Engineer role'}

Create a professional, realistic resume with:
1. ATS-optimized content with relevant keywords
2. Quantifiable achievements with specific metrics
3. Strong action verbs and industry terminology
4. Tailored content for the target company/position if provided
5. Professional but realistic experience levels

IMPORTANT: Return ONLY a valid JSON object in this exact structure:

{
  "resume": {
    "header": {
      "name": "Full Name",
      "title": "Professional Title",
      "email": "email@domain.com",
      "phone": "(555) 123-4567",
      "location": "City, State",
      "linkedin": "linkedin.com/in/username",
      "github": "github.com/username"
    },
    "summary": "2-3 sentence professional summary highlighting key achievements and skills",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "City, State",
        "startDate": "YYYY",
        "endDate": "YYYY or Present",
        "achievements": [
          "Quantified achievement with specific metrics",
          "Another achievement with impact measurement",
          "Technical accomplishment with results"
        ]
      }
    ],
    "education": [
      {
        "degree": "Degree Name",
        "school": "University Name",
        "location": "City, State",
        "graduationDate": "YYYY",
        "gpa": "X.X/4.0",
        "honors": "magna cum laude"
      }
    ],
    "skills": {
      "languages": ["Language1", "Language2"],
      "frameworks": ["Framework1", "Framework2"],
      "tools": ["Tool1", "Tool2"],
      "soft": ["Skill1", "Skill2"]
    },
    "certifications": [
      {
        "name": "Certification Name",
        "issuer": "Issuing Organization",
        "date": "YYYY"
      }
    ]
  }${config.includeCoverLetter ? `,
  "coverLetter": "Professional cover letter content addressing the specific role and company, highlighting relevant experience and enthusiasm for the position."` : ''}
}

Generate realistic, professional content. Include 2-4 work experiences, relevant education, and appropriate skills for the target role. Make achievements specific with metrics when possible.`;

    const response = await aiService.generate(prompt, {
      temperature: 0.7,
      maxTokens: config.includeCoverLetter ? 4000 : 3000
    });

    // Parse JSON response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      return {
        resume: parsedData.resume || fallbackResume,
        coverLetter: parsedData.coverLetter || (config.includeCoverLetter ? fallbackCoverLetter : undefined)
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Failed to generate resume:', error);
    // Return fallback content
    return {
      resume: fallbackResume,
      coverLetter: config.includeCoverLetter ? fallbackCoverLetter : undefined
    };
  }
}