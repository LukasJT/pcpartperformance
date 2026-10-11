"""Create original editorial schematics. No manufacturer photographs or model geometry are used."""
from pathlib import Path
import html
import json
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "data" / "editorial-oct11" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
INK, MUTED, PANEL, ACCENT, BLUE, WHITE = "#14283e", "#64768c", "#e8eef5", "#15806e", "#4779bd", "#ffffff"
FONT = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/seguisb.ttf")
ROWS = [
    ("prebuilt-gaming-pc-canada-shortlist", "Configuration · Seller · CAD", "shortlist", "CA"),
    ("prebuilt-gaming-pc-us-offer-checklist", "Exact SKU · Seller · USD", "shortlist", "US"),
    ("build-vs-buy-pc-complete-cost", "Compare the complete system", "balance", ""),
    ("prebuilt-pc-internals-upgrade-checklist", "Inside the complete system", "internals", ""),
    ("phone-body-size-vs-screen-diagonal", "Body dimensions and display", "geometry", ""),
    ("choose-smaller-phone-practical-checklist", "Size · Case · Support", "smallphone", ""),
    ("3d-pc-builder-preview-limits", "Preview → check the evidence", "wireframe", ""),
    ("checked-pc-offers-region-freshness", "Identity · Region · Time", "offer", ""),
    ("micron-ai-demand-memory-evidence", "Server milestones · Desktop checks", "memory", ""),
    ("nvidia-rtx-spark-windows-october-2026", "Platform · Applications · Availability", "platform", ""),
    ("amd-linux-26-16-ubuntu-blender", "Version · OS · Workload", "driver", ""),
    ("pixel-october-2026-patch-level", "Bulletin date ≠ patch level", "update", ""),
]

class Canvas:
    def __init__(self, title):
        self.image = Image.new("RGB", (1200, 675), "#f5f8fc")
        self.draw = ImageDraw.Draw(self.image)
        self.svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img">', '<title>'+html.escape(title)+'</title>', '<rect width="1200" height="675" fill="#f5f8fc"/>']
        self.rect((40,40,1160,635), WHITE, None, 32)
        self.text((76,70), "PC PART PERFORMANCE", 19, MUTED, True)
        self.text((76,108), title, 33, INK, True)
        for x in range(82,1130,38):
            self.ellipse((x,595,x+3,598), "#d9e4ef")

    def rect(self, box, fill, stroke=None, radius=14, width=3):
        self.draw.rounded_rectangle(box, radius=radius, fill=fill, outline=stroke, width=width)
        x,y,x2,y2=box
        self.svg.append(f'<rect x="{x}" y="{y}" width="{x2-x}" height="{y2-y}" rx="{radius}" fill="{fill or "none"}" stroke="{stroke or "none"}" stroke-width="{width}"/>')

    def line(self, points, color=INK, width=4):
        self.draw.line(points, fill=color, width=width, joint="curve")
        path=" ".join(f'{x},{y}' for x,y in points)
        self.svg.append(f'<polyline points="{path}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>')

    def ellipse(self, box, fill=None, stroke=None, width=3):
        self.draw.ellipse(box, fill=fill, outline=stroke, width=width)
        x,y,x2,y2=box
        self.svg.append(f'<ellipse cx="{(x+x2)/2}" cy="{(y+y2)/2}" rx="{(x2-x)/2}" ry="{(y2-y)/2}" fill="{fill or "none"}" stroke="{stroke or "none"}" stroke-width="{width}"/>')

    def text(self, point, value, size=25, fill=INK, bold=False):
        font_file=FONT_BOLD if bold else FONT
        font=ImageFont.truetype(str(font_file),size) if font_file.exists() else ImageFont.truetype("DejaVuSans.ttf",size)
        self.draw.text(point,value,font=font,fill=fill)
        x,y=point
        self.svg.append(f'<text x="{x}" y="{y+size}" fill="{fill}" font-size="{size}" font-family="Segoe UI, sans-serif" font-weight="{600 if bold else 400}">{html.escape(value)}</text>')

    def tick(self,x,y,color=ACCENT):
        self.line([(x,y+12),(x+11,y+23),(x+32,y)],color,6)

    def tower(self,x,y,w=110,h=230):
        self.rect((x,y,x+w,y+h),PANEL,INK,18,4)
        self.rect((x+15,y+16,x+w-15,y+h-17),WHITE,None,10)
        self.ellipse((x+31,y+39,x+w-31,y+87),None,BLUE,4)
        self.ellipse((x+31,y+103,x+w-31,y+151),None,ACCENT,4)
        self.line([(x+25,y+h-42),(x+w-25,y+h-42)],MUTED,4)

    def phone(self,x,y,w=145,h=280,color=BLUE):
        self.rect((x,y,x+w,y+h),WHITE,color,24,5)
        self.rect((x+10,y+14,x+w-10,y+h-14),PANEL,None,17)
        self.line([(x+w/2-19,y+25),(x+w/2+19,y+25)],color,4)

    def calendar(self,x,y,label,accent=BLUE):
        self.rect((x,y,x+208,y+180),WHITE,accent,18,4)
        self.rect((x+2,y+2,x+206,y+48),accent,None,16)
        self.text((x+20,y+64),label,24,INK,True)
        for yy in range(y+117,y+158,30):
            for xx in range(x+25,x+174,43):
                self.ellipse((xx,yy,xx+7,yy+7),PANEL)

    def memory(self,x,y,w=220):
        self.rect((x,y,x+w,y+74),"#e0f2ed",ACCENT,8,4)
        for xx in range(x+16,x+w-18,39):
            self.rect((xx,y+15,xx+27,y+48),INK,None,3)
        for xx in range(x+17,x+w-14,18):
            self.line([(xx,y+75),(xx,y+87)],"#c39842",4)

def paint(c,kind,region):
    if kind=="shortlist":
        for x,label in [(125,"SKU"),(470,"SELLER"),(815,region)]:
            c.rect((x,222,x+260,552),PANEL,None,20)
            c.tower(x+79,254,101,181)
            c.tick(x+37,490)
            c.text((x+86,484),label,27,INK,True)
    elif kind=="balance":
        c.line([(250,282),(950,282)],BLUE,7)
        c.line([(600,282),(600,520)],INK,8)
        c.line([(490,524),(710,524)],INK,8)
        c.ellipse((581,263,619,301),WHITE,INK,4)
        for x in [230,910]:
            c.line([(x,284),(x-96,442),(x+96,442),(x,284)],MUTED,4)
        c.memory(139,372,180)
        c.tower(864,329,94,140)
        c.text((164,491),"DIY",30,INK,True)
        c.text((837,491),"PREBUILT",30,INK,True)
    elif kind=="internals":
        c.rect((394,206,775,560),PANEL,INK,18,5)
        c.rect((426,242,692,453),WHITE,BLUE,12,4)
        c.ellipse((462,275,562,375),None,BLUE,5)
        c.memory(464,411,197)
        c.rect((426,478,646,536),INK,None,8)
        for x,y,label,target in [(105,258,"COOLING",(471,319)),(860,313,"RAM",(646,424)),(123,485,"PSU",(431,503))]:
            c.text((x,y),label,29,INK,True)
            start=(x+160,y+22) if x<394 else (x-15,y+22)
            c.line([start,target],ACCENT,4)
    elif kind=="geometry":
        for x,y,w,h in [(148,245,139,286),(457,235,147,298),(790,219,153,313)]:
            c.phone(x,y,w,h)
            c.line([(x+14,y+h-29),(x+w-14,y+47)],ACCENT,4)
            c.line([(x,y+h+22),(x+w,y+h+22)],INK,4)
        c.text((507,550),"WIDTH",21,MUTED,True)
    elif kind=="smallphone":
        c.phone(161,230,145,286)
        c.rect((479,251,694,514),PANEL,INK,8,4)
        c.line([(479,272),(587,345),(694,272)],BLUE,4)
        c.calendar(855,301,"SUPPORT",ACCENT)
        c.tick(529,433)
    elif kind=="wireframe":
        front=[(347,277),(662,277),(662,538),(347,538),(347,277)]
        back=[(466,218),(782,218),(782,478),(466,478),(466,218)]
        c.line(front,BLUE,4);c.line(back,BLUE,4)
        for p,q in zip(front[:4],back[:4]):c.line([p,q],BLUE,4)
        c.line([(399,395),(696,395),(750,367),(453,367),(399,395)],ACCENT,6)
        c.line([(696,395),(696,438),(750,410),(750,367)],ACCENT,5)
        c.line([(399,395),(399,438),(696,438)],ACCENT,5)
        c.line([(824,218),(849,218),(849,539),(824,539)],MUTED,4)
        c.text((910,353),"CHECK",27,INK,True)
        c.tick(936,414)
    elif kind=="offer":
        c.rect((164,235,669,544),PANEL,BLUE,20,4)
        for y,width in [(275,355),(346,240),(417,313),(488,184)]:
            c.tick(192,y)
            c.line([(256,y+12),(256+width,y+12)],INK,6)
        c.ellipse((826,248,1011,433),WHITE,ACCENT,6)
        c.line([(918,277),(918,340),(967,363)],INK,6)
        c.text((819,476),"CHECKED",29,INK,True)
    elif kind=="memory":
        c.rect((114,224,358,546),PANEL,INK,16,4)
        for y in [250,316,382,448]:
            c.rect((138,y,334,y+48),WHITE,BLUE,6,3)
            c.ellipse((306,y+19,314,y+27),ACCENT)
        c.memory(473,328,246)
        c.tower(889,258,119,257)
        c.text((140,551),"SERVER",22,MUTED,True)
        c.text((870,551),"DESKTOP",22,MUTED,True)
        c.line([(777,235),(777,556)],PANEL,5)
    elif kind=="platform":
        c.rect((126,273,476,484),PANEL,INK,16,4)
        c.rect((149,297,453,460),WHITE,None,9)
        c.line([(104,495),(498,495)],INK,12)
        c.memory(188,351,226)
        c.tower(568,271,129,249)
        c.calendar(842,295,"AVAILABLE?")
    elif kind=="driver":
        for x,label in [(127,"VERSION"),(468,"OS"),(810,"WORKLOAD")]:
            c.rect((x,267,x+253,505),PANEL,BLUE,18,4)
            c.ellipse((x+79,317,x+175,413),WHITE,ACCENT,5)
            c.tick(x+110,350)
            c.text((x+23,440),label,26,INK,True)
        for x in [385,726]:c.line([(x,375),(x+67,375)],INK,5)
    elif kind=="update":
        c.phone(163,235,150,293)
        c.tick(215,352)
        c.calendar(476,305,"BULLETIN",BLUE)
        c.calendar(855,305,"PATCH LEVEL",ACCENT)
        c.text((730,368),"≠",48,INK,True)

manifest=[]
for slug,title,kind,region in ROWS:
    canvas=Canvas(title)
    paint(canvas,kind,region)
    canvas.image.save(OUT/(slug+".png"),optimize=True)
    (OUT/(slug+".svg")).write_text("\n".join(canvas.svg+["</svg>"]),encoding="utf-8")
    manifest.append({"slug":slug,"png":"/assets/editorial-oct11/"+slug+".png","svg":"/assets/editorial-oct11/"+slug+".svg","width":1200,"height":675,"type":"original editorial schematic","provenance":"Generated by continuation-editorial-assets.py; no external media or exact-product geometry.","rights":"Original site artwork; no third-party asset licence or attribution obligation introduced.","limitations":"Concept illustration; not a product photograph, measured benchmark or physical fit model."})
(OUT.parent/"asset-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
print(f"Created {len(manifest)} original 1200×675 PNG/SVG asset pairs.")
