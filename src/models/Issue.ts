import mongoose, { Schema, models } from 'mongoose';

export interface IIssue {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  images: string[];
  videos: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reportedBy: mongoose.Types.ObjectId;
  aiAnalysis: {
    category: string;
    severity: string;
    description: string;
    suggested_department: string;
    estimated_impact: string;
    priority_score: number;
    resolution_steps: string[];
    estimated_resolution_time: string;
  };
  upvotes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  verifiedBy: mongoose.Types.ObjectId[];
  resolvedVotes: mongoose.Types.ObjectId[];
  region: string;
  assignedTo: string;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'pothole',
        'water_leakage',
        'streetlight',
        'waste_management',
        'road_damage',
        'drainage',
        'public_property',
        'safety_hazard',
        'pollution',
        'other',
      ],
      default: 'other',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['reported', 'verified', 'in_progress', 'resolved', 'closed'],
      default: 'reported',
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aiAnalysis: {
      category: String,
      severity: String,
      description: String,
      suggested_department: String,
      estimated_impact: String,
      priority_score: Number,
      resolution_steps: [String],
      estimated_resolution_time: String,
    },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    resolvedVotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    region: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
IssueSchema.index({ 'location.lat': 1, 'location.lng': 1 });
IssueSchema.index({ category: 1, status: 1 });
IssueSchema.index({ region: 1, createdAt: -1 });
IssueSchema.index({ createdAt: -1 });

const Issue = models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
export default Issue;
