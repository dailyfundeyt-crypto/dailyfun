import { useGradient } from '@/contexts/GradientContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const colorPresets = [
  { name: 'Passionate Reds', value: '#FF8080' },
  { name: 'Sunny Yellows', value: '#FFD700' },
  { name: 'Lush Greens Hell', value: '#98FB98' },
  { name: 'Calm Blues Hell', value: '#ADD8E6' },
  { name: 'Sweet Pinks Hell', value: '#FFC0CB' },
  { name: 'Calm Blues Dunkel', value: '#4682B4' },
  { name: 'Green Mittel', value: '#228B22' },
  { name: 'Lush Greens Dunkel', value: '#3CB371' },
  { name: 'Passionate Reds Pink', value: '#FF69B4' },
  { name: 'Weiß', value: '#FFFFFF' },
];

export const GradientSettings = () => {
  const { settings, updateSettings } = useGradient();

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Hintergrund-Farbverlauf</CardTitle>
          <CardDescription className="text-muted-foreground">
            Passe den dynamischen Scroll-Farbverlauf deiner Seite an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="gradient-enabled" className="text-foreground">
              Hintergrund-Farbverlauf aktivieren
            </Label>
            <Switch
              id="gradient-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Start Color */}
              <div className="space-y-3">
                <Label className="text-foreground">Startfarbe des Verlaufs</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => updateSettings({ startColor: preset.value })}
                      className={`h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                        settings.startColor === preset.value
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.startColor}
                    onChange={(e) => updateSettings({ startColor: e.target.value })}
                    className="h-10 w-20 rounded border border-border bg-background cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.startColor}
                    onChange={(e) => updateSettings({ startColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    placeholder="#ADD8E6"
                  />
                </div>
              </div>

              {/* End Color */}
              <div className="space-y-3">
                <Label className="text-foreground">Endfarbe des Verlaufs (beim Scrollen)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.endColor}
                    onChange={(e) => updateSettings({ endColor: e.target.value })}
                    className="h-10 w-20 rounded border border-border bg-background cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.endColor}
                    onChange={(e) => updateSettings({ endColor: e.target.value })}
                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <Label className="text-foreground">Verlaufsrichtung</Label>
                <Select
                  value={settings.direction}
                  onValueChange={(value: 'vertical' | 'horizontal') => updateSettings({ direction: value })}
                >
                  <SelectTrigger className="bg-background text-foreground border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="vertical">Vertikal (oben nach unten)</SelectItem>
                    <SelectItem value="horizontal">Horizontal (links nach rechts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scroll Trigger Point */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-foreground">Scroll-Trigger-Punkt</Label>
                  <span className="text-sm text-muted-foreground">{settings.scrollTriggerPoint}%</span>
                </div>
                <Slider
                  value={[settings.scrollTriggerPoint]}
                  onValueChange={([value]) => updateSettings({ scrollTriggerPoint: value })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Definiert, wie weit der Benutzer scrollen muss, bis der Hintergrund vollständig zur Endfarbe übergeblendet ist.
                </p>
              </div>

              {/* Transition Speed */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-foreground">Übergangsgeschwindigkeit</Label>
                  <span className="text-sm text-muted-foreground">{settings.transitionSpeed.toFixed(1)}s</span>
                </div>
                <Slider
                  value={[settings.transitionSpeed * 10]}
                  onValueChange={([value]) => updateSettings({ transitionSpeed: value / 10 })}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Legt fest, wie schnell der Farbwechsel beim Scrollen erfolgt.
                </p>
              </div>

              {/* Adjust Button Colors */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="adjust-buttons" className="text-foreground">
                    Button-Farben anpassen
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Passt die Button-Farben automatisch an den Hintergrund an
                  </p>
                </div>
                <Switch
                  id="adjust-buttons"
                  checked={settings.adjustButtonColors}
                  onCheckedChange={(adjustButtonColors) => updateSettings({ adjustButtonColors })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
