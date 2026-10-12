import * as React from 'react';
import type { ChartContextProps } from './types';
export const ChartContext = React.createContext<ChartContextProps | null>(null);
