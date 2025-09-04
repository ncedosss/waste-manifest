/*
  CaptureImage_Binary.js
  Captures a signature as a byte array, then reads encoded data from the array
  and prints on monitor.
  Copyright © 2019 Wacom. All Rights Reserved.
*/
function print( txt ) {
  WScript.Echo(txt);
}
main();
function toBase64(binaryData) {
  // Use ADODB.Stream to convert binary to Base64
  var stream = new ActiveXObject("ADODB.Stream");
  stream.Type = 1; // binary
  stream.Open();
  stream.Write(binaryData);
  stream.Position = 0;

  var base64 = new ActiveXObject("MSXML2.DOMDocument")
    .createElement("Base64Data");
  base64.dataType = "bin.base64";
  base64.nodeTypedValue = stream.Read();
  stream.Close();

  return base64.text.replace(/\r\n/g, ""); // clean line breaks
}
function main() {
  sigCtl = new ActiveXObject("Florentis.SigCtl");
  sigCtl.SetProperty("Licence", "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3YmM5Y2IxYWIxMGE0NmUxODI2N2E5MTJkYTA2ZTI3NiIsImV4cCI6MjE0NzQ4MzY0NywiaWF0IjoxNTYwOTUwMjcyLCJyaWdodHMiOlsiU0lHX1NES19DT1JFIiwiU0lHQ0FQVFhfQUNDRVNTIl0sImRldmljZXMiOlsiV0FDT01fQU5ZIl0sInR5cGUiOiJwcm9kIiwibGljX25hbWUiOiJTaWduYXR1cmUgU0RLIiwid2Fjb21faWQiOiI3YmM5Y2IxYWIxMGE0NmUxODI2N2E5MTJkYTA2ZTI3NiIsImxpY191aWQiOiJiODUyM2ViYi0xOGI3LTQ3OGEtYTlkZS04NDlmZTIyNmIwMDIiLCJhcHBzX3dpbmRvd3MiOltdLCJhcHBzX2lvcyI6W10sImFwcHNfYW5kcm9pZCI6W10sIm1hY2hpbmVfaWRzIjpbXX0.ONy3iYQ7lC6rQhou7rz4iJT_OJ20087gWz7GtCgYX3uNtKjmnEaNuP3QkjgxOK_vgOrTdwzD-nm-ysiTDs2GcPlOdUPErSp_bcX8kFBZVmGLyJtmeInAW6HuSp2-57ngoGFivTH_l1kkQ1KMvzDKHJbRglsPpd4nVHhx9WkvqczXyogldygvl0LRidyPOsS5H2GYmaPiyIp9In6meqeNQ1n9zkxSHo7B11mp_WXJXl0k1pek7py8XYCedCNW5qnLi4UCNlfTd6Mk9qz31arsiWsesPeR9PN121LBJtiPi023yQU8mgb9piw_a-ccciviJuNsEuRDN3sGnqONG3dMSA")
  dynCapt = new ActiveXObject("Florentis.DynamicCapture");
  rc = dynCapt.Capture(sigCtl,"WacomSTU-430","Please sign");
  if( rc == 0 ) {
    sigCtl.Signature.ExtraData("AdditionalData") = "CaptureImage.js Additional Data";
    flags = 0x000800 | 0x080000 | 0x400000; // SigObj.outputBinary | SigObj.color32BPP | SigObj.encodeData
    var binarySigData = sigCtl.Signature.RenderBitmap("", 110, 110, "image/png", 1.5, 0x000000, 0xffffff, 0.0, 0.0, flags );
	
	sig = sigCtl.Signature;
	rc = sig.ReadEncodedBitmap(binarySigData);
  var base64Img = toBase64(binarySigData);
	if( rc == 0 ) 
	{
		print("data:image/png;base64,\t" + base64Img);
	}
	else 
	{
       print("Error reading file: " + rc);
       switch(rc) 
	   {
          case 1: print("File not found");
                  break;
          case 2: print("File is not a supported image type");
                  break;
          case 3: print("Encoded signature data not found in image");
                  break;
       }
	}
  }
  else {
    print("Capture returned: " + rc);
    switch(rc) {
      case 1:   print("Cancelled");
                break;
      case 100: print("Signature tablet not found");
                break;
      case 103: print("Capture not licensed");
                break;
    }
  }

}
