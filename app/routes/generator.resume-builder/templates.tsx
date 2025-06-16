// Resume Template Components

import { cn } from "~/lib/utils";
import type { StructuredResume } from "./ai-prompts";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe,
  Calendar,
  Award,
  GraduationCap,
  Building2,
  Code,
  Star
} from "lucide-react";

interface ResumeTemplateProps {
  resume: StructuredResume;
  theme: 'modern' | 'classic' | 'creative' | 'minimal';
}

// Modern Theme - Clean and contemporary with blue accents
export function ModernTemplate({ resume }: { resume: StructuredResume }) {
  return (
    <div className="bg-white p-8 text-gray-900 font-sans max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{resume.header.name}</h1>
        <h2 className="text-xl font-medium text-blue-600 mb-4">{resume.header.title}</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <span>{resume.header.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span>{resume.header.phone}</span>
          </div>
          {resume.header.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{resume.header.location}</span>
            </div>
          )}
          {resume.header.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              <span>{resume.header.linkedin}</span>
            </div>
          )}
          {resume.header.github && (
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-blue-600" />
              <span>{resume.header.github}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">Professional Summary</h3>
        <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4 uppercase tracking-wide">Experience</h3>
        <div className="space-y-5">
          {resume.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Building2 className="h-4 w-4" />
                    <span>{exp.company}</span>
                    {exp.location && <span className="text-gray-500">• {exp.location}</span>}
                  </div>
                </div>
                <div className="text-right text-gray-600 font-medium">
                  {exp.startDate} - {exp.endDate}
                </div>
              </div>
              <ul className="space-y-1 ml-4">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} className="text-gray-700 relative">
                    <span className="absolute -left-4 text-blue-600">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4 uppercase tracking-wide">Education</h3>
        <div className="space-y-3">
          {resume.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>{edu.school}</span>
                  {edu.location && <span>• {edu.location}</span>}
                </div>
                {(edu.gpa || edu.honors) && (
                  <div className="text-sm text-gray-600 mt-1">
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    {edu.gpa && edu.honors && <span> • </span>}
                    {edu.honors && <span>{edu.honors}</span>}
                  </div>
                )}
              </div>
              <div className="text-gray-600 font-medium">{edu.graduationDate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4 uppercase tracking-wide">Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resume.skills.languages && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Programming Languages</h4>
              <div className="flex flex-wrap gap-2">
                {resume.skills.languages.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {resume.skills.frameworks && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frameworks & Libraries</h4>
              <div className="flex flex-wrap gap-2">
                {resume.skills.frameworks.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {resume.skills.tools && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tools & Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {resume.skills.tools.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {resume.skills.soft && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Core Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {resume.skills.soft.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4 uppercase tracking-wide">Certifications</h3>
          <div className="space-y-2">
            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  <span className="text-gray-600">• {cert.issuer}</span>
                </div>
                <span className="text-gray-600">{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Classic Theme - Traditional and professional
export function ClassicTemplate({ resume }: { resume: StructuredResume }) {
  return (
    <div className="bg-white p-8 text-black font-serif max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">{resume.header.name}</h1>
        <h2 className="text-lg mb-3">{resume.header.title}</h2>
        
        <div className="text-sm space-y-1">
          <div>{resume.header.email} • {resume.header.phone}</div>
          {resume.header.location && <div>{resume.header.location}</div>}
          <div className="flex justify-center gap-4">
            {resume.header.linkedin && <span>{resume.header.linkedin}</span>}
            {resume.header.github && <span>{resume.header.github}</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-center">PROFESSIONAL SUMMARY</h3>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-4"></div>
        <p className="text-justify leading-relaxed">{resume.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-center">PROFESSIONAL EXPERIENCE</h3>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-4"></div>
        <div className="space-y-5">
          {resume.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-bold">{exp.title}</h4>
                  <div className="italic">{exp.company}{exp.location && `, ${exp.location}`}</div>
                </div>
                <div className="font-bold">{exp.startDate} - {exp.endDate}</div>
              </div>
              <ul className="mt-2 space-y-1">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} className="relative pl-4">
                    <span className="absolute left-0">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-center">EDUCATION</h3>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-4"></div>
        <div className="space-y-3">
          {resume.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{edu.degree}</h4>
                <div className="italic">{edu.school}{edu.location && `, ${edu.location}`}</div>
                {(edu.gpa || edu.honors) && (
                  <div className="text-sm mt-1">
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    {edu.gpa && edu.honors && <span>, </span>}
                    {edu.honors && <span>{edu.honors}</span>}
                  </div>
                )}
              </div>
              <div className="font-bold">{edu.graduationDate}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 text-center">TECHNICAL SKILLS</h3>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-4"></div>
        <div className="space-y-2">
          {resume.skills.languages && (
            <div><strong>Programming Languages:</strong> {resume.skills.languages.join(', ')}</div>
          )}
          {resume.skills.frameworks && (
            <div><strong>Frameworks & Libraries:</strong> {resume.skills.frameworks.join(', ')}</div>
          )}
          {resume.skills.tools && (
            <div><strong>Tools & Technologies:</strong> {resume.skills.tools.join(', ')}</div>
          )}
          {resume.skills.soft && (
            <div><strong>Core Competencies:</strong> {resume.skills.soft.join(', ')}</div>
          )}
        </div>
      </div>

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-center">CERTIFICATIONS</h3>
          <div className="w-16 h-0.5 bg-gray-800 mx-auto mb-4"></div>
          <div className="space-y-2">
            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <span><strong>{cert.name}</strong> - {cert.issuer}</span>
                <span>{cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Creative Theme - Bold and unique with purple accents
export function CreativeTemplate({ resume }: { resume: StructuredResume }) {
  return (
    <div className="bg-white text-gray-900 font-sans max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Header with creative sidebar */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{resume.header.name}</h1>
            <h2 className="text-lg opacity-90">{resume.header.title}</h2>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-purple-200">CONTACT</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="break-all">{resume.header.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{resume.header.phone}</span>
              </div>
              {resume.header.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{resume.header.location}</span>
                </div>
              )}
              {resume.header.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  <span className="break-all">{resume.header.linkedin}</span>
                </div>
              )}
              {resume.header.github && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="break-all">{resume.header.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills in Sidebar */}
          <div className="mb-6">
            <h3 className="font-bold mb-3 text-purple-200">SKILLS</h3>
            <div className="space-y-3">
              {resume.skills.languages && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-purple-100">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.languages.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-purple-500 bg-opacity-50 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resume.skills.frameworks && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-purple-100">Frameworks</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.frameworks.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-purple-500 bg-opacity-50 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resume.skills.tools && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-purple-100">Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.tools.map((skill, idx) => (
                      <span key={idx} className="text-xs bg-purple-500 bg-opacity-50 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certifications in Sidebar */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 text-purple-200">CERTIFICATIONS</h3>
              <div className="space-y-2">
                {resume.certifications.map((cert, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-semibold">{cert.name}</div>
                    <div className="text-purple-200 text-xs">{cert.issuer} • {cert.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-6">
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-purple-600 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5" />
              ABOUT ME
            </h3>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              EXPERIENCE
            </h3>
            <div className="space-y-5">
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-purple-300">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                      <div className="text-purple-600 font-medium">{exp.company}</div>
                      {exp.location && <div className="text-gray-500 text-sm">{exp.location}</div>}
                    </div>
                    <div className="text-purple-600 font-medium text-sm">
                      {exp.startDate} - {exp.endDate}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="text-gray-700 relative pl-4">
                        <span className="absolute left-0 text-purple-600">▸</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              EDUCATION
            </h3>
            <div className="space-y-4">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="border-l-2 border-purple-300 pl-4 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <div className="text-purple-600">{edu.school}</div>
                      {edu.location && <div className="text-gray-500 text-sm">{edu.location}</div>}
                      {(edu.gpa || edu.honors) && (
                        <div className="text-sm text-gray-600 mt-1">
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                          {edu.gpa && edu.honors && <span> • </span>}
                          {edu.honors && <span>{edu.honors}</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-purple-600 font-medium text-sm">{edu.graduationDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Theme - Clean and simple
export function MinimalTemplate({ resume }: { resume: StructuredResume }) {
  return (
    <div className="bg-white p-12 text-gray-800 font-light max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-thin mb-2 tracking-wide">{resume.header.name}</h1>
        <h2 className="text-xl text-gray-600 mb-6 font-light">{resume.header.title}</h2>
        
        <div className="flex flex-wrap gap-8 text-sm text-gray-600">
          <span>{resume.header.email}</span>
          <span>{resume.header.phone}</span>
          {resume.header.location && <span>{resume.header.location}</span>}
          {resume.header.linkedin && <span>{resume.header.linkedin}</span>}
          {resume.header.github && <span>{resume.header.github}</span>}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-12">
        <p className="text-lg leading-relaxed font-light text-gray-700">{resume.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-12">
        <h3 className="text-lg font-light mb-8 tracking-widest uppercase text-gray-900">Experience</h3>
        <div className="space-y-8">
          {resume.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{exp.title}</h4>
                  <div className="text-gray-600">{exp.company}{exp.location && `, ${exp.location}`}</div>
                </div>
                <div className="text-gray-500 text-sm">{exp.startDate}—{exp.endDate}</div>
              </div>
              <div className="space-y-2">
                {exp.achievements.map((achievement, i) => (
                  <div key={i} className="text-gray-700 font-light">{achievement}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-12">
        <h3 className="text-lg font-light mb-8 tracking-widest uppercase text-gray-900">Education</h3>
        <div className="space-y-6">
          {resume.education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <div className="text-gray-600">{edu.school}{edu.location && `, ${edu.location}`}</div>
                  {(edu.gpa || edu.honors) && (
                    <div className="text-sm text-gray-500 mt-1 font-light">
                      {edu.gpa && <span>GPA {edu.gpa}</span>}
                      {edu.gpa && edu.honors && <span> • </span>}
                      {edu.honors && <span>{edu.honors}</span>}
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-sm">{edu.graduationDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-12">
        <h3 className="text-lg font-light mb-8 tracking-widest uppercase text-gray-900">Skills</h3>
        <div className="space-y-4">
          {resume.skills.languages && (
            <div>
              <span className="font-medium text-gray-900">Languages</span>
              <span className="ml-4 text-gray-700 font-light">{resume.skills.languages.join(' • ')}</span>
            </div>
          )}
          {resume.skills.frameworks && (
            <div>
              <span className="font-medium text-gray-900">Frameworks</span>
              <span className="ml-4 text-gray-700 font-light">{resume.skills.frameworks.join(' • ')}</span>
            </div>
          )}
          {resume.skills.tools && (
            <div>
              <span className="font-medium text-gray-900">Tools</span>
              <span className="ml-4 text-gray-700 font-light">{resume.skills.tools.join(' • ')}</span>
            </div>
          )}
          {resume.skills.soft && (
            <div>
              <span className="font-medium text-gray-900">Core Competencies</span>
              <span className="ml-4 text-gray-700 font-light">{resume.skills.soft.join(' • ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div>
          <h3 className="text-lg font-light mb-8 tracking-widest uppercase text-gray-900">Certifications</h3>
          <div className="space-y-3">
            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-medium text-gray-900">{cert.name}</span>
                <span className="text-gray-600 font-light">{cert.issuer} • {cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main template renderer
export function ResumeTemplate({ resume, theme }: ResumeTemplateProps) {
  switch (theme) {
    case 'modern':
      return <ModernTemplate resume={resume} />;
    case 'classic':
      return <ClassicTemplate resume={resume} />;
    case 'creative':
      return <CreativeTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    default:
      return <ModernTemplate resume={resume} />;
  }
}