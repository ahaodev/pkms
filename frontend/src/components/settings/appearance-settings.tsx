import { useState } from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export interface AppearanceConfig {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: string;
}

interface AppearanceSettingsProps {
  onSave?: (config: AppearanceConfig) => void;
}

export function AppearanceSettings({ onSave }: AppearanceSettingsProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('zh-CN');
  const [fontSize, setFontSize] = useState('medium');

  const handleSaveAppearance = () => {
    const config: AppearanceConfig = {
      theme,
      language,
      fontSize
    };

    onSave?.(config);

    toast({
      title: "设置已保存",
      description: "外观设置已成功更新",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          外观设置
        </CardTitle>
        <CardDescription>
          自定义应用程序的外观和显示偏好
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 主题设置 */}
        <div className="space-y-3">
          <Label>主题</Label>
          <RadioGroup value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                浅色主题
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                深色主题
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center cursor-pointer">
                <Monitor className="mr-2 h-4 w-4" />
                跟随系统 (推荐)
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            选择您偏好的主题外观，或跟随系统设置自动切换
          </p>
        </div>

        {/* 语言设置 */}
        <div className="space-y-3">
          <Label htmlFor="language">语言</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="选择显示语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">简体中文</SelectItem>
              <SelectItem value="zh-TW">繁體中文</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
              <SelectItem value="ja-JP">日本語</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            更改界面显示语言
          </p>
        </div>

        {/* 字体大小设置 */}
        <div className="space-y-3">
          <Label htmlFor="fontSize">字体大小</Label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger>
              <SelectValue placeholder="选择字体大小" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">小号</SelectItem>
              <SelectItem value="medium">中号 (推荐)</SelectItem>
              <SelectItem value="large">大号</SelectItem>
              <SelectItem value="extra-large">特大号</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            调整界面文字的大小以获得更好的阅读体验
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveAppearance} className="ml-auto">
          保存更改
        </Button>
      </CardFooter>
    </Card>
  );
}