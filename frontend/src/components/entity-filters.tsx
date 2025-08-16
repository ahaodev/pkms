import { useState, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';

// 基础过滤器配置
export interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'dependent-select';
  placeholder?: string;
  options?: FilterOption[];
  dependsOn?: string; // 用于级联选择
  allValue?: string; // "全部"选项的值，默认为 'all'
  className?: string;
  disabled?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  data?: unknown; // 用于存储额外数据，如项目ID等
}

// 简单过滤器属性
interface SimpleFiltersProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  totalCount?: number;  
  countLabel?: string;
  countIcon?: LucideIcon;
  className?: string;
}

// 卡片式过滤器属性  
interface CardFiltersProps extends SimpleFiltersProps {
  title: string;
  titleIcon?: LucideIcon;
  layout?: 'horizontal' | 'grid';
  gridCols?: 1 | 2 | 3 | 4;
}

// 简单的水平布局过滤器
export function SimpleFilters({
  filters,
  values,
  onChange,
  totalCount,
  countLabel,
  countIcon: CountIcon,
  className = ""
}: SimpleFiltersProps) {
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || `搜索${filter.label}...`}
            value={value as string || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className={filter.className || "max-w-sm"}
            disabled={filter.disabled}
          />
        );

      case 'select':
        return (
          <Select
            key={filter.key}
            value={value as string || filter.allValue || 'all'}
            onValueChange={(val) => onChange(filter.key, val === (filter.allValue || 'all') ? undefined : val)}
            disabled={filter.disabled}
          >
            <SelectTrigger className={filter.className || "w-48"}>
              <SelectValue placeholder={filter.placeholder || `选择${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={filter.allValue || 'all'}>
                全部{filter.label}
              </SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon ? (
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  ) : (
                    option.label
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'dependent-select': {
        const dependentValue = filter.dependsOn ? values[filter.dependsOn] : null;
        const filteredOptions = filter.options?.filter(option => 
          !filter.dependsOn || !dependentValue || option.data === dependentValue
        ) || [];

        return (
          <Select
            key={filter.key}
            value={value as string || filter.allValue || 'all'}
            onValueChange={(val) => onChange(filter.key, val === (filter.allValue || 'all') ? undefined : val)}
            disabled={filter.disabled || (filter.dependsOn && !dependentValue) || filteredOptions.length === 0}
          >
            <SelectTrigger className={filter.className || "w-48"}>
              <SelectValue placeholder={filter.placeholder || `选择${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={filter.allValue || 'all'}>
                全部{filter.label}
              </SelectItem>
              {filteredOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon ? (
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  ) : (
                    option.label
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {filters.map(renderFilter)}
      
      <div className="flex-1" />
      
      {(totalCount !== undefined && countLabel) && (
        <div className="flex items-center text-sm text-muted-foreground">
          {CountIcon && <CountIcon className="mr-1 h-4 w-4" />}
          共 {totalCount} {countLabel}
        </div>
      )}
    </div>
  );
}

// 卡片式过滤器
export function CardFilters({
  title,
  titleIcon: TitleIcon,
  layout = 'grid',
  gridCols = 2,
  filters,
  values,
  onChange,
  className = ""
}: CardFiltersProps) {
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="space-y-2">
            <Label>{filter.label}</Label>
            <Select
              value={value as string || filter.allValue || 'all'}
              onValueChange={(val) => onChange(filter.key, val === (filter.allValue || 'all') ? undefined : val)}
              disabled={filter.disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `选择${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={filter.allValue || 'all'}>
                  全部{filter.label}
                </SelectItem>
                {filter.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'dependent-select': {
        const dependentValue = filter.dependsOn ? values[filter.dependsOn] : null;
        const filteredOptions = filter.options?.filter(option => 
          !filter.dependsOn || !dependentValue || option.data === dependentValue
        ) || [];

        return (
          <div key={filter.key} className="space-y-2">
            <Label>{filter.label}</Label>
            <Select
              value={value as string || filter.allValue || 'all'}
              onValueChange={(val) => onChange(filter.key, val === (filter.allValue || 'all') ? undefined : val)}
              disabled={Boolean(filter.disabled || (filter.dependsOn && !dependentValue))}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `选择${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={filter.allValue || 'all'}>
                  全部{filter.label}
                </SelectItem>
                {filteredOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const gridClassName = layout === 'grid' 
    ? `grid grid-cols-1 md:grid-cols-${Math.min(gridCols, 2)} lg:grid-cols-${gridCols} gap-4`
    : 'flex flex-wrap gap-4';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {TitleIcon && <TitleIcon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={gridClassName}>
          {filters.map(renderFilter)}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook 用于简化过滤器状态管理
export function useFilters<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const onChange = useCallback((key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, onChange, reset, setValues };
}