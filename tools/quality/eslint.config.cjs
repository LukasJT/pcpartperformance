'use strict';
module.exports=[{
 files:['scripts/master-*.cjs','scripts/master-*.js','scripts/compatibility-evidence.cjs','scripts/news-sitemap-response.mjs'],
 languageOptions:{ecmaVersion:2022,sourceType:'commonjs',globals:{require:'readonly',module:'readonly',exports:'readonly',__dirname:'readonly',process:'readonly',console:'readonly',URL:'readonly',Buffer:'readonly',document:'readonly',window:'readonly',localStorage:'readonly',navigator:'readonly',setTimeout:'readonly',clearTimeout:'readonly',CustomEvent:'readonly',Event:'readonly',fetch:'readonly',Intl:'readonly',structuredClone:'readonly'}},
 rules:{'no-undef':'error','no-dupe-keys':'error','no-unreachable':'error','no-unsafe-finally':'error','no-cond-assign':['error','except-parens'],'valid-typeof':'error','constructor-super':'error','no-constant-condition':['error',{checkLoops:false}]}
},{files:['scripts/*.mjs'],languageOptions:{sourceType:'module'}}];
