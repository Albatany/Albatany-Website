import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
test('community SQL enforces privacy, ownership, rate limits, and unique reactions',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email text); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; insert into auth.users values('${alice}','alice-private@example.com'),('${bob}','bob-private@example.com');`);
 await db.exec(readFileSync('supabase/schema.sql','utf8'));
 const as=async(uid,role='authenticated')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec(`set role ${role}`);};
 await as('', 'anon');await assert.rejects(db.query('select * from private.guestbook_entries'),/permission denied/);await assert.rejects(db.query("select public.add_guestbook_entry('Hello there')"),/permission denied/);
 await as(alice);await assert.rejects(db.query("select public.add_guestbook_entry('Hello there')"),/ALIAS_REQUIRED/);await db.query("select public.set_community_alias('pixel-alice')");await assert.rejects(db.query("select public.set_community_alias('<script>alert(1)</script>')"),/INVALID_ALIAS/);
 const created=await db.query("select public.add_guestbook_entry('Hello from Alice') as id");const id=created.rows[0].id;await assert.rejects(db.query("select public.add_guestbook_entry('Spam message')"),/RATE_LIMIT/);
 await db.query("select public.toggle_project_reaction('bridge','heart')");
 await as(bob);await db.query("select public.set_community_alias('pixel-bob')");await db.query('select public.delete_guestbook_entry($1)',[id]);
 let list=await db.query('select * from public.list_guestbook_entries()');assert.equal(list.rows.length,1);assert.equal(list.rows[0].is_owner,false);assert.deepEqual(Object.keys(list.rows[0]).sort(),['alias','body','created_at','id','is_owner']);assert.ok(!JSON.stringify(list.rows).includes('alice-private'));assert.ok(!JSON.stringify(list.rows).includes(alice));
 await db.query("select public.toggle_project_reaction('bridge','fire')");let counts=await db.query('select * from public.project_reaction_counts()');assert.equal(counts.rows.length,2);assert.equal(counts.rows.find(r=>r.kind==='fire').is_mine,true);assert.equal(counts.rows.find(r=>r.kind==='heart').is_mine,false);await assert.rejects(db.query("select public.toggle_project_reaction('made-up','heart')"),/INVALID_REACTION/);
 await as('','anon');list=await db.query('select * from public.list_guestbook_entries()');assert.equal(list.rows[0].is_owner,false);assert.ok(!JSON.stringify(await db.query('select * from public.project_reaction_counts()')).includes(bob));
 await as(alice);await db.query('select public.delete_my_community_data()');list=await db.query('select * from public.list_guestbook_entries()');assert.equal(list.rows.length,0);counts=await db.query('select * from public.project_reaction_counts()');assert.equal(counts.rows.length,1);assert.equal(counts.rows[0].kind,'fire');await db.query("select public.set_community_alias('again-alice')");await assert.rejects(db.query("select public.add_guestbook_entry('Rate limit still works')"),/RATE_LIMIT/);
 await db.exec('reset role');await db.query("update private.community_rate_limits set last_reaction_at=now()-interval '1 second' where user_id=$1",[bob]);await as(bob);await db.query("select public.toggle_project_reaction('bridge','clap')");counts=await db.query('select * from public.project_reaction_counts()');assert.equal(counts.rows.length,1);assert.equal(counts.rows[0].kind,'clap');assert.equal(Number(counts.rows[0].total),1);
 }finally{await db.close();}
});
