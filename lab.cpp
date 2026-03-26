//AES
#include <bits/stdc++.h>
using namespace std;

unsigned char s[4][4];

// S-box
unsigned char sbox[256] = {
0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
};

unsigned char invsbox[256];

// simple key (same used for all rounds)
unsigned char key[16] = {
0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,
0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff
};

void AddRoundKey(){
    for(int i=0;i<4;i++)
        for(int j=0;j<4;j++)
            s[j][i] ^= key[i*4+j];
}

void subBytes(){
    for(int i=0;i<4;i++)
        for(int j=0;j<4;j++)
            s[i][j] = sbox[s[i][j]];
}

void invSubBytes(){
    for(int i=0;i<4;i++)
        for(int j=0;j<4;j++)
            s[i][j] = invsbox[s[i][j]];
}

void shiftRows(){
    rotate(s[1], s[1]+1, s[1]+4);
    rotate(s[2], s[2]+2, s[2]+4);
    rotate(s[3], s[3]+3, s[3]+4);
}

void invShiftRows(){
    rotate(s[1], s[1]+3, s[1]+4);
    rotate(s[2], s[2]+2, s[2]+4);
    rotate(s[3], s[3]+1, s[3]+4);
}

unsigned char mul(unsigned char a, unsigned char b){
    unsigned char r=0;
    while(b){
        if(b&1) r^=a;
        if(a&0x80) a=(a<<1)^0x1b;
        else a<<=1;
        b>>=1;
    }
    return r;
}

void mixColumns(){
    for(int i=0;i<4;i++){
        unsigned char a=s[0][i], b=s[1][i], c=s[2][i], d=s[3][i];
        s[0][i]=mul(a,2)^mul(b,3)^c^d;
        s[1][i]=a^mul(b,2)^mul(c,3)^d;
        s[2][i]=a^b^mul(c,2)^mul(d,3);
        s[3][i]=mul(a,3)^b^c^mul(d,2);
    }
}

void invMixColumns(){
    for(int i=0;i<4;i++){
        unsigned char a=s[0][i], b=s[1][i], c=s[2][i], d=s[3][i];
        s[0][i]=mul(a,14)^mul(b,11)^mul(c,13)^mul(d,9);
        s[1][i]=mul(a,9)^mul(b,14)^mul(c,11)^mul(d,13);
        s[2][i]=mul(a,13)^mul(b,9)^mul(c,14)^mul(d,11);
        s[3][i]=mul(a,11)^mul(b,13)^mul(c,9)^mul(d,14);
    }
}

void buildInv(){
    for(int i=0;i<256;i++)
        invsbox[sbox[i]] = i;
}

// ENCRYPT
void encrypt(){
    AddRoundKey();
    for(int i=0;i<9;i++){
        subBytes();
        shiftRows();
        mixColumns();
        AddRoundKey();
    }
    subBytes();
    shiftRows();
    AddRoundKey();
}

// DECRYPT
void decrypt(){
    AddRoundKey();
    for(int i=0;i<9;i++){
        invShiftRows();
        invSubBytes();
        AddRoundKey();
        invMixColumns();
    }
    invShiftRows();
    invSubBytes();
    AddRoundKey();
}

int main(){
    buildInv();

    string text = "HELLO AES DEMO!";
    
    // load plaintext
    for(int i=0;i<16;i++)
        s[i%4][i/4] = (i<text.size()?text[i]:0);

    encrypt();

    cout<<"Encrypted:\n";
    for(int i=0;i<4;i++)
        for(int j=0;j<4;j++)
            cout<<hex<<(int)s[j][i]<<" ";

    decrypt();

    cout<<"\n\nDecrypted:\n";
    for(int i=0;i<4;i++)
        for(int j=0;j<4;j++)
            cout<<(char)s[j][i];
}

//SDES
#include <bits/stdc++.h>
using namespace std;

string p(string s, vector<int> a){
    string r="";
    for(int i:a) r+=s[i-1];
    return r;
}

string ls(string s,int n){
    return s.substr(n)+s.substr(0,n);
}

string x(string a,string b){
    string r="";
    for(int i=0;i<a.size();i++)
        r+=(a[i]==b[i]?'0':'1');
    return r;
}

int S0[4][4]={{0,1,0,3},{2,1,3,2},{1,0,2,0},{2,1,3,3}};
int S1[4][4]={{0,0,1,2},{3,1,2,0},{1,3,2,3},{0,1,0,3}};

// f function
string f(string r,string k){
    string ep=p(r,{4,1,2,3,2,3,4,1});
    string xo=x(ep,k);

    string l=xo.substr(0,4), rr=xo.substr(4,4);

    int r0=(l[0]-'0')*2+(l[3]-'0');
    int c0=(l[1]-'0')*2+(l[2]-'0');

    int r1=(rr[0]-'0')*2+(rr[3]-'0');
    int c1=(rr[1]-'0')*2+(rr[2]-'0');

    string s=bitset<2>(S0[r0][c0]).to_string()
            +bitset<2>(S1[r1][c1]).to_string();

    return p(s,{2,4,3,1});
}

int main(){
    string k="1010000010";
    string pt="11010111";

    // Key generation
    string t=p(k,{3,5,2,7,4,10,1,9,8,6});

    string l=ls(t.substr(0,5),1);
    string r=ls(t.substr(5,5),1);
    string k1=p(l+r,{6,3,7,4,8,5,10,9});

    l=ls(l,2); r=ls(r,2);
    string k2=p(l+r,{6,3,7,4,8,5,10,9});

    cout<<"K1="<<k1<<"  K2="<<k2<<"\n";

    //  ENCRYPT 
    string ip=p(pt,{2,6,3,1,4,8,5,7});
    string L=ip.substr(0,4), R=ip.substr(4,4);

    string L1=x(L,f(R,k1));
    swap(L1,R);

    string L2=x(L1,f(R,k2));

    string ct=p(L2+R,{4,1,3,5,7,2,8,6});

    cout<<"Cipher = "<<ct<<"\n";

    //  DECRYPT 
    string ip2=p(ct,{2,6,3,1,4,8,5,7});
    string Ld=ip2.substr(0,4), Rd=ip2.substr(4,4);

    //  keys reversed
    string Ld1=x(Ld,f(Rd,k2));
    swap(Ld1,Rd);

    string Ld2=x(Ld1,f(Rd,k1));

    string pt2=p(Ld2+Rd,{4,1,3,5,7,2,8,6});

    cout<<"Decrypted = "<<pt2<<"\n";
}
//RSA 
#include<bits/stdc++.h>
using namespace std;
int modexp(int b,int e,int m){
    int r=1;
    while(e){
        if(e&1) r=r*b%m;
        b=b*b%m;
        e>>=1;
    }
    return r;
}
int modInv(int e,int phi){
    for(int d=1;d<phi;d++){
        if((d*e)%phi==1){
            return d;
        }
    }
    return -1;
}
int main(){
    int p=17;
    int q=19;
    int n=p*q;
    int phi=(p-1)*(q-1);
    int e=13;
    int d=modInv(e,phi);
    //Encrypt
    int m=25;
    int k=modexp(m,e,n);
    cout<<modexp(k,d,n);
}
//DHE
#include <iostream>
using namespace std;

long long modexp(long long b,long long e,long long m){
    long long r=1;
    while(e){
        if(e&1) r=r*b%m;
        b=b*b%m;
        e>>=1;
    }
    return r;
}

int main(){
    long long q=23, a=5;

    // Alice & Bob secrets
    long long xa=6, xb=15;

    // Attacker (Mallory) secrets
    long long xm1=3, xm2=7;

    // Public keys
    long long ya=modexp(a,xa,q); // Alice sends
    long long yb=modexp(a,xb,q); // Bob sends

    //  NORMAL 
    long long ka = modexp(yb, xa, q);
    long long kb = modexp(ya, xb, q);

    cout<<"Normal Shared Key:\n";
    cout<<"Alice: "<<ka<<"  Bob: "<<kb<<"\n\n";

    // MITM ATTACK 
    // Mallory intercepts and sends fake keys

    long long ym1 = modexp(a, xm1, q); // fake to Alice
    long long ym2 = modexp(a, xm2, q); // fake to Bob

    // Alice thinks this is Bob's key
    long long ka_mitm = modexp(ym1, xa, q);

    // Bob thinks this is Alice's key
    long long kb_mitm = modexp(ym2, xb, q);

    // Mallory computes both keys
    long long km_a = modexp(ya, xm1, q); // with Alice
    long long km_b = modexp(yb, xm2, q); // with Bob

    cout<<"MITM Attack:\n";
    cout<<"Alice key (with Mallory): "<<ka_mitm<<"\n";
    cout<<"Bob key (with Mallory): "<<kb_mitm<<"\n";
    cout<<"Mallory-Alice key: "<<km_a<<"\n";
    cout<<"Mallory-Bob key: "<<km_b<<"\n";
}
//MD5
#include <bits/stdc++.h>
using namespace std;

uint32_t leftRotate(uint32_t x, int c){
    return (x << c) | (x >> (32 - c));
}

// MD5 functions
uint32_t F(uint32_t b,uint32_t c,uint32_t d){ return (b&c)|(~b&d); }
uint32_t G(uint32_t b,uint32_t c,uint32_t d){ return (b&d)|(c&~d); }
uint32_t H(uint32_t b,uint32_t c,uint32_t d){ return b^c^d; }
uint32_t I(uint32_t b,uint32_t c,uint32_t d){ return c^(b|~d); }

int main(){
    string input;
    cout<<"Enter message: ";
    cin>>input;

    // Convert to binary
    string bin="";
    for(char ch:input)
        bin += bitset<8>(ch).to_string();

    // Padding
    bin += "1";
    while(bin.length() % 512 != 448)
        bin += "0";

    bitset<64> len(input.length()*8);
    bin += len.to_string();

    // Initialize buffers
    uint32_t A=0x67452301;
    uint32_t B=0xefcdab89;
    uint32_t C=0x98badcfe;
    uint32_t D=0x10325476;

    // Process each 512-bit block
    for(int i=0;i<bin.length();i+=512){

        vector<uint32_t> M(16);
        for(int j=0;j<16;j++){
            string word = bin.substr(i+j*32,32);
            M[j] = bitset<32>(word).to_ulong();
        }

        uint32_t a=A,b=B,c=C,d=D;

        // Round 1
        a = b + leftRotate(a + F(b,c,d) + M[0], 7);
        d = a + leftRotate(d + F(a,b,c) + M[1], 12);
        c = d + leftRotate(c + F(d,a,b) + M[2], 17);
        b = c + leftRotate(b + F(c,d,a) + M[3], 22);

        // Round 2
        a = b + leftRotate(a + G(b,c,d) + M[1], 5);
        d = a + leftRotate(d + G(a,b,c) + M[6], 9);

        // Round 3
        a = b + leftRotate(a + H(b,c,d) + M[5], 4);

        // Round 4
        a = b + leftRotate(a + I(b,c,d) + M[0], 6);

        // Add to buffers
        A += a;
        B += b;
        C += c;
        D += d;
    }

    // Output
    cout<<"\nFinal MD5 Hash (simplified): ";
    cout<<hex<<A<<B<<C<<D<<endl;

    return 0;
}