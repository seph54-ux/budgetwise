'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-budget-suggestions.ts';
import '@/ai/flows/ai-savings-suggestions.ts';
