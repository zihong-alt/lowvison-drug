require('dotenv').config();
const express=require('express'), cors=require('cors'), multer=require('multer');
const app=express(), upload=multer({storage:multer.memoryStorage()});
app.use(cors()); app.use(express.json({limit:'2mb'})); app.use(express.static('public'));
app.post('/api/analyze', upload.single('image'), async (req,res)=>{
 const instruction=req.body.instruction||'', key=process.env.DOUBAO_API_KEY;
 const endpoint=process.env.DOUBAO_ENDPOINT || ((process.env.DOUBAO_BASE_URL||'').replace(/\/$/,'')+'/v1/chat/completions');
 if(!key || !process.env.DOUBAO_BASE_URL && !process.env.DOUBAO_ENDPOINT) return res.json({medicine:'Amoxicillin',summary:'Demo result: Amoxicillin 0.5 g, three times daily; expiry August 2027.',match:!instruction||/amoxicillin|阿莫西林/i.test(instruction),expiry:'2027-08',confidence:.94,advice:'Please verify the name, strength and expiry date with a pharmacist.'});
 try { const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:process.env.DOUBAO_MODEL||'Doubao-Seed-2.0-lite',messages:[{role:'user',content:[{type:'text',text:'Read this medicine package and prescription. Target: '+(instruction||'unspecified')+'. Return JSON with medicine,dosage,expiry,match,confidence,summary,advice.'},{type:'image_url',image_url:{url:'data:'+(req.file?.mimetype||'image/jpeg')+';base64,'+(req.file?.buffer?.toString('base64')||'')}}]}],temperature:.1})}); const raw=await r.json(); if(raw.choices?.[0]?.message?.content){try{let x=raw.choices[0].message.content.replace(/^`json|`$/g,'').trim(); return res.json(JSON.parse(x));}catch(e){}} res.json(raw); } catch(e){res.status(502).json({error:'Doubao service unavailable.'});}
});
app.listen(process.env.PORT||3000,()=>console.log('Medicine Vision running'));
